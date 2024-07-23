import { Arg, Ctx, Field, Float, InputType, Int, ObjectType, Query, Resolver, registerEnumType } from "type-graphql";
import { Context, prisma } from "../utils/context.js";
import { Wall, generateNavMesh, NavMesh, NavMeshVertex, addAreaToMesh, FloorIncludeAreas } from "../navMesh/GenerateNavMesh.js";
import { LatLng } from "../graphqlSchemaTypes/Building.js";
import { areWallsEqual, findPolygonCenter, pointInPolygon } from "../navMesh/helpers.js";
import { findShortestPath } from "../navMesh/NavigateWithNavMesh.js";
import { throwGraphQLBadInput } from "../utils/generic.js";
import { Prisma } from "@prisma/client";

export enum PathfindingMethod {
    Standard = "Standard",
    Voronoi = "Voronoi"
}

registerEnumType(PathfindingMethod, {
    name: "PathfindingMethod", // Mandatory
});

@InputType()
class NavigationInput {
    @Field(type => Int)
    floorDatabaseId?: number

    @Field(type => Int, { nullable: true })
    areaFromId?: number

    @Field(type => Int, { nullable: true })
    areaToId?: number

    @Field(type => Float, { nullable: true })
    locationFromLat?: number

    @Field(type => Float, { nullable: true })
    locationFromLon?: number

    @Field(type => Float, { nullable: true })
    locationToLat?: number

    @Field(type => Float, { nullable: true })
    locationToLon?: number

    @Field(type => PathfindingMethod, { nullable: true })
    pathfindingMethod?: PathfindingMethod
}

@ObjectType()
class NavigationResult {
    @Field((type) => [LatLng]!)
    path: LatLng[]

    @Field()
    walls: string

    @Field()
    navMesh: string

    @Field(type => Boolean)
    neededToGenerateANavMesh: boolean

    @Field(type => Float)
    distance: number
}

const getAreaDetails = async (floor: FloorIncludeAreas, areaId?: number, locationLat?: number, locationLon?: number) => {
    let resultLatLon;
    let resultAreaIgnorableWalls: Wall[] = [];
    let resultArea;
    if (areaId === undefined) {
        if (!locationLat || !locationLon) throw throwGraphQLBadInput('From location not found')
        resultLatLon = new LatLng(locationLat, locationLon)
        // remove the walls from the area that the user is in
        const shape = floor.areas.find((area) => pointInPolygon(resultLatLon!, (area.shape as unknown as GeoJSON.Feature<GeoJSON.Polygon>).geometry.coordinates[0]))?.shape as unknown | undefined as GeoJSON.Feature<GeoJSON.Polygon> | undefined;
        if (shape) {
            resultAreaIgnorableWalls = shape.geometry.coordinates[0].map(position => new LatLng(position[1], position[0])).map((latLng, i, arr) => new Wall(latLng, arr[(i + 1) % arr.length]))
        }
    }
    else {
        resultArea = await prisma.area.findUnique({
            where: {
                id: areaId,
            }
        })
        if (!resultArea || !resultArea.shape) throw throwGraphQLBadInput('From Area not found')
        const shape = resultArea.shape as unknown as GeoJSON.Feature<GeoJSON.Polygon>
        resultAreaIgnorableWalls = shape.geometry.coordinates[0].map(position => new LatLng(position[1], position[0])).map((latLng, i, arr) => new Wall(latLng, arr[(i + 1) % arr.length]))
        resultLatLon = findPolygonCenter(shape)
    }
    return [resultLatLon, resultAreaIgnorableWalls, resultArea] as const
}

const loadOrGenerateNavMesh = async (floor: FloorIncludeAreas, pathfindingMethod: PathfindingMethod) => {
    let navMesh: NavMesh;
    let walls: Wall[];
    let neededToGenerateANavMesh = false;
    if ((floor.navMesh === null && pathfindingMethod === PathfindingMethod.Standard) || (floor.voronoiNavMesh === null && pathfindingMethod === PathfindingMethod.Voronoi)) {
        neededToGenerateANavMesh = true;
        const [genNavMesh, genWalls] = generateNavMesh(floor, pathfindingMethod);
        const data: Prisma.FloorUpdateInput = {
            walls: JSON.parse(JSON.stringify(genWalls))
        }
        pathfindingMethod === PathfindingMethod.Standard ?
            data.navMesh = JSON.parse(JSON.stringify(genNavMesh)) :
            data.voronoiNavMesh = JSON.parse(JSON.stringify(genNavMesh))
        await prisma.floor.update({
            where: {
                id: floor.id
            },
            data
        })
        navMesh = genNavMesh
        walls = genWalls
    }
    else {
        navMesh = pathfindingMethod === PathfindingMethod.Standard ?
            (floor.navMesh as Prisma.JsonArray) as unknown as NavMeshVertex[] :
            (floor.voronoiNavMesh as Prisma.JsonArray) as unknown as NavMeshVertex[]
        walls = (floor.walls as Prisma.JsonArray) as unknown as Wall[];
    }
    return {navMesh, walls, neededToGenerateANavMesh} as const;
}

@Resolver(of => NavigationResult)
export class NavResolver {
    @Query((returns) => NavigationResult)
    async getNavBetweenAreas(
        @Arg('data') data: NavigationInput,
        @Ctx() ctx: Context,
    ): Promise<NavigationResult> {
        const floor = await ctx.prisma.floor.findUnique({
            where: {
                id: data.floorDatabaseId,
            },
            include: {
                areas: true
            }
        })
        if (!floor ) throw throwGraphQLBadInput('Floor not found')

        const [fromLatLon, fromAreaIgnorableWalls, fromArea] = await getAreaDetails(floor, data.areaFromId, data.locationFromLat, data.locationFromLon);
        const [toLatLon, toAreaIgnorableWalls, toArea] = await getAreaDetails(floor, data.areaToId, data.locationToLat, data.locationToLon);

        if (!toLatLon || !fromLatLon) throw throwGraphQLBadInput('Issue with starting or ending GPS locations')
        if (fromArea && fromArea.floorId !== data.floorDatabaseId) throw throwGraphQLBadInput("Navigation between floors is not supported")

        const pathfindingMethod = data.pathfindingMethod ?? PathfindingMethod.Standard;
        const {navMesh, walls, neededToGenerateANavMesh} = await loadOrGenerateNavMesh(floor, pathfindingMethod);

        const fromAreaWallsWithoutIgnorable = walls.filter(wall => {
            return fromAreaIgnorableWalls.findIndex((ignorableWall) => {
                return areWallsEqual(ignorableWall, wall)
            }) === -1
        })
        const toAreaWallsWithoutIgnorable = walls.filter(wall => {
            return toAreaIgnorableWalls.findIndex((ignorableWall) => {
                return areWallsEqual(ignorableWall, wall)
            }) === -1
        })

        // This is only used in the visualization, This and the extra strification requried for the extra fields takes at least 20 ms on my m1 mac
        const allWallsWithIgnorable = toAreaWallsWithoutIgnorable.filter(wall => {
            return fromAreaIgnorableWalls.findIndex((ignorableWall) => {
                return areWallsEqual(ignorableWall, wall)
            }) === -1
        })

        //  adds points on the nav mesh for the tromLatlon and the toLatLon. These points are added based on the edgesWithoutIgnorable so that they can go through the walls of their own building
        const fromIndex = addAreaToMesh(navMesh, fromArea, fromAreaWallsWithoutIgnorable, fromLatLon);
        const toIndex = addAreaToMesh(navMesh, toArea, toAreaWallsWithoutIgnorable, toLatLon);

        const [shortestPath, distance] = findShortestPath(navMesh, fromIndex, toIndex)
        return {
            path: shortestPath,
            walls: JSON.stringify(allWallsWithIgnorable),
            // This converts an Edge (which is a navigatible connection) into a Wall becuase I had already written the wall dispalying code on the frontend and I wanted the edges to be in the same formate
            navMesh: JSON.stringify(navMesh.flatMap((vertex) => vertex.edges.flatMap(((edge) => new Wall(vertex.point, navMesh[edge.index].point))))),
            neededToGenerateANavMesh,
            distance
        };
    }
}

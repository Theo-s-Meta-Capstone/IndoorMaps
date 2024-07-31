import { Arg, Ctx, Field, FieldResolver, Float, InputType, Int, Query, Resolver, Root, registerEnumType } from "type-graphql";
import { Context, prisma } from "../utils/context.js";
import { Wall, generateNavMesh, NavMesh, NavMeshVertex, addAreaToMesh, FloorIncludeAreas } from "../navMesh/GenerateNavMesh.js";
import { LatLng } from "../graphqlSchemaTypes/Building.js";
import { areWallsEqual, findPolygonCenter, pointInPolygon } from "../navMesh/helpers.js";
import { findShortestPath } from "../navMesh/NavigateWithNavMesh.js";
import { throwGraphQLBadInput } from "../utils/generic.js";
import { Prisma } from "@prisma/client";
import { NavigationResult } from "../graphqlSchemaTypes/Navigation.js";
import { readData, writeData } from "../utils/redisCache.js";

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
    let floorPerimeterWalls: Wall[];
    let neededToGenerateANavMesh = false;
    // checks if the requested navMesh is standard and a computed version of the standard nav mesh is not available, or the same but for the voronoi nav mesh
    if (floor.floorPerimeterWalls === null || (pathfindingMethod === "Standard" && floor.navMesh === null) || (pathfindingMethod === "Voronoi" && floor.voronoiNavMesh === null)) {
        neededToGenerateANavMesh = true;
        const [genNavMesh, genAreaWalls, genFloorPerimeterWalls] = generateNavMesh(floor, pathfindingMethod);
        const data: Prisma.FloorUpdateInput = {
            walls: JSON.parse(JSON.stringify(genAreaWalls)),
            floorPerimeterWalls: JSON.parse(JSON.stringify(genFloorPerimeterWalls))
        }
        pathfindingMethod === "Standard" ?
            data.navMesh = JSON.parse(JSON.stringify(genNavMesh)) :
            data.voronoiNavMesh = JSON.parse(JSON.stringify(genNavMesh))
        const floorWithGeneratedData = await prisma.floor.update({
            where: {
                id: floor.id
            },
            data,
            include: {
                areas: true,
            }
        })
        await writeData("floor" + floor.id, JSON.stringify(floorWithGeneratedData))
        navMesh = genNavMesh
        walls = genAreaWalls
        floorPerimeterWalls = genFloorPerimeterWalls
    }
    else {
        // sets the nav mesh to the voronoi or standard nav mesh as stored in the floor row
        navMesh = pathfindingMethod === "Standard" ?
            (floor.navMesh as Prisma.JsonArray) as unknown as NavMeshVertex[] :
            (floor.voronoiNavMesh as Prisma.JsonArray) as unknown as NavMeshVertex[]
        walls = (floor.walls as Prisma.JsonArray) as unknown as Wall[];
        floorPerimeterWalls = (floor.floorPerimeterWalls as Prisma.JsonArray) as unknown as Wall[];
    }
    return { navMesh, walls, floorPerimeterWalls, neededToGenerateANavMesh } as const;
}

@Resolver(of => NavigationResult)
export class NavResolver {
    @Query((returns) => NavigationResult)
    async getNavBetweenAreas(
        @Arg('data') data: NavigationInput,
        @Ctx() ctx: Context,
    ): Promise<NavigationResult> {
        const cache = await readData("floor" + data.floorDatabaseId)
        let floor: Prisma.FloorGetPayload<{ include: { areas: true } }> | null = null;
        if (!cache) {
            floor = await ctx.prisma.floor.findUnique({
                where: {
                    id: data.floorDatabaseId,
                },
                include: {
                    areas: true
                }
            })
        } else {
            floor = JSON.parse(cache) as Prisma.FloorGetPayload<{ include: { areas: true } }>
        }
        if (!floor) throw throwGraphQLBadInput('Floor not found')

        const [fromLatLon, fromAreaIgnorableWalls, fromArea] = await getAreaDetails(floor, data.areaFromId, data.locationFromLat, data.locationFromLon);
        const [toLatLon, toAreaIgnorableWalls, toArea] = await getAreaDetails(floor, data.areaToId, data.locationToLat, data.locationToLon);

        if (!toLatLon || !fromLatLon) throw throwGraphQLBadInput('Issue with starting or ending GPS locations')
        if (fromArea && fromArea.floorId !== data.floorDatabaseId) throw throwGraphQLBadInput("Navigation between floors is not supported")

        const pathfindingMethod = data.pathfindingMethod ?? PathfindingMethod.Standard;
        // The floorPerimeterWalls are added back in after the ignorable walls are removed, This ensures that the floor perimeter walls are respected
        const { navMesh, walls, floorPerimeterWalls, neededToGenerateANavMesh } = await loadOrGenerateNavMesh(floor, pathfindingMethod);

        //  adds points on the nav mesh for the tromLatlon and the toLatLon. These points are added based on the edgesWithoutIgnorable so that they can go through the walls of their own building
        const fromIndex = addAreaToMesh(navMesh, fromArea, walls, fromAreaIgnorableWalls, floorPerimeterWalls, fromLatLon);
        const toIndex = addAreaToMesh(navMesh, toArea, walls, toAreaIgnorableWalls, floorPerimeterWalls, toLatLon);

        const [shortestPath, distance] = findShortestPath(navMesh, fromIndex, toIndex)
        return {
            path: shortestPath,
            neededToGenerateANavMesh,
            distance,
            // these fields pass data to the field resolvers below
            fromAreaIgnorableWalls,
            toAreaWallsWithoutIgnorable: walls,
            navMeshData: navMesh,
        };
    }

    // Using Field resolvers to handle walls and navMesh fields so that not ever request has to do the expensive JSON.stringify()
    @FieldResolver((returns) => String)
    walls(@Root() navigationResult: NavigationResult) {
        // This is only used in the visualization, This and the extra stringification requried for the extra fields takes at least 20 ms on my m1 mac
        const allWallsWithIgnorable = navigationResult.toAreaWallsWithoutIgnorable.filter(wall => {
            return navigationResult.fromAreaIgnorableWalls.findIndex((ignorableWall) => {
                return areWallsEqual(ignorableWall, wall)
            }) === -1
        })
        return JSON.stringify(allWallsWithIgnorable)
    }

    @FieldResolver((returns) => String)
    navMesh(@Root() navigationResult: NavigationResult) {
        // This converts an Edge (which is a navigatible connection) into a Wall becuase I had already written the wall dispalying code on the frontend and I wanted the edges to be in the same formate
        return JSON.stringify(navigationResult.navMeshData.flatMap((vertex) => vertex.edges.flatMap(((edge) => new Wall(vertex.point, navigationResult.navMeshData[edge.index].point)))))
    }
}

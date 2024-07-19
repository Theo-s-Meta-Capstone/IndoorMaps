import { Arg, Ctx, Field, Float, InputType, Int, ObjectType, Query, Resolver, registerEnumType } from "type-graphql";
import { Context, prisma } from "../utils/context.js";
import { Wall, generateNavMesh, NavMesh, NavMeshVertex, addAreaToMesh } from "../navMesh/GenerateNavMesh.js";
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

@Resolver(of => NavigationResult)
export class NavResolver {
    @Query((returns) => NavigationResult)
    async getNavBetweenAreas(
        @Arg('data') data: NavigationInput,
        @Ctx() ctx: Context,
    ): Promise<NavigationResult> {
        const toArea = await ctx.prisma.area.findUnique({
            where: {
                id: data.areaToId,
            },
            include: {
                floor: {
                    include: {
                        areas: true
                    }
                }
            }
        })

        if (!toArea || !toArea.shape) throw throwGraphQLBadInput('To Area not found')
        const toShape = toArea.shape as unknown as GeoJSON.Feature<GeoJSON.Polygon>
        const toAreaIgnorableWalls = toShape.geometry.coordinates[0].map(position => new LatLng(position[1], position[0])).map((latLng, i, arr) => new Wall(latLng, arr[(i + 1) % arr.length]))
        const fromAreaIgnorableWalls: Wall[] = [];
        let fromLatLon: LatLng | undefined;
        let fromArea;
        if (data.areaFromId === undefined) {
            if (!data.locationFromLat || !data.locationFromLon) throw throwGraphQLBadInput('From location not found')
            fromLatLon = new LatLng(data.locationFromLat, data.locationFromLon)
            // remove the walls from the area that the user is in
            const fromShape = toArea.floor.areas.find((area) => pointInPolygon(fromLatLon!, (area.shape as unknown as GeoJSON.Feature<GeoJSON.Polygon>).geometry.coordinates[0]))?.shape as unknown | undefined as GeoJSON.Feature<GeoJSON.Polygon> | undefined;
            if (fromShape) {
                fromAreaIgnorableWalls.push(...fromShape.geometry.coordinates[0].map(position => new LatLng(position[1], position[0])).map((latLng, i, arr) => new Wall(latLng, arr[(i + 1) % arr.length])))
            }
        }
        else {
            fromArea = await ctx.prisma.area.findUnique({
                where: {
                    id: data.areaFromId,
                }
            })
            if (!fromArea || !fromArea.shape) throw throwGraphQLBadInput('From Area not found')
            if (fromArea.floorId !== toArea.floorId) throw throwGraphQLBadInput("Navigation between floors is not currently supported")
            const fromShape = fromArea.shape as unknown as GeoJSON.Feature<GeoJSON.Polygon>
            fromAreaIgnorableWalls.push(...fromShape.geometry.coordinates[0].map(position => new LatLng(position[1], position[0])).map((latLng, i, arr) => new Wall(latLng, arr[(i + 1) % arr.length])))
            fromLatLon = findPolygonCenter(fromShape)
        }

        const toLatLon = findPolygonCenter(toShape)

        if (!toLatLon || !fromLatLon) throw throwGraphQLBadInput('Issue with starting or ending GPS locations')

        const pathfindingMethod = data.pathfindingMethod ?? PathfindingMethod.Standard;
        let navMesh: NavMesh;
        let walls: Wall[] = [];
        let neededToGenerateANavMesh = false

        if ((toArea.floor.navMesh === null && pathfindingMethod === PathfindingMethod.Standard) || (toArea.floor.voronoiNavMesh === null && pathfindingMethod === PathfindingMethod.Voronoi)) {
            neededToGenerateANavMesh = true;
            const [genNavMesh, genWalls] = generateNavMesh(toArea.floor, pathfindingMethod);
            const data: { [key: string]: object } = {
                walls: JSON.parse(JSON.stringify(genWalls))
            }
            pathfindingMethod === PathfindingMethod.Standard ?
                data.navMesh = JSON.parse(JSON.stringify(genNavMesh)) :
                data.voronoiNavMesh = JSON.parse(JSON.stringify(genNavMesh))
            await prisma.floor.update({
                where: {
                    id: toArea.floor.id
                },
                data
            })
            navMesh = genNavMesh
            walls = genWalls
        }
        else {
            navMesh = pathfindingMethod === PathfindingMethod.Standard ?
                (toArea.floor.navMesh as Prisma.JsonArray).map((navMeshVertex) => navMeshVertex as unknown as NavMeshVertex) :
                (toArea.floor.voronoiNavMesh as Prisma.JsonArray).map((navMeshVertex) => navMeshVertex as unknown as NavMeshVertex);
            walls = (toArea.floor.walls as Prisma.JsonArray).map((wall) => wall as unknown as Wall)
        }

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

        // This is only used in the visualization, This and the extra strification requried for the extra fields take at lease 20 ms on my m1 mac
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

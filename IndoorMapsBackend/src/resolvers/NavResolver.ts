import { Arg, Ctx, Field, Float, InputType, Int, ObjectType, Query, Resolver } from "type-graphql";
import { Context, prisma } from "../utils/context.js";
import { Wall, generateNavMesh, NavMesh, NavMeshVertex } from "../navMesh/GenerateNavMesh.js";
import { LatLng } from "../graphqlSchemaTypes/Building.js";
import { areWallsEqual, findPolygonCenter, pointInPolygon } from "../navMesh/helpers.js";
import { findShortestPath } from "../navMesh/NavigateWithNavMesh.js";
import { throwGraphQLBadInput } from "../utils/generic.js";
import { Prisma } from "@prisma/client";

@InputType()
class NavigationInput {
    @Field(type => Int, { nullable: true })
    areaFromId?: number

    @Field(type => Int)
    areaToId: number

    @Field(type => Float, { nullable: true })
    locationFromLat?: number

    @Field(type => Float, { nullable: true })
    locationFromLon?: number
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
}

@Resolver()
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
        const ignorableWalls = toShape.geometry.coordinates[0].map(position => new LatLng(position[1], position[0])).map((latLng, i, arr) => new Wall(latLng, arr[(i + 1) % arr.length]))
        let fromLatLon: LatLng | undefined;
        if (data.areaFromId === undefined) {
            if(!data.locationFromLat || !data.locationFromLon) throw throwGraphQLBadInput('From location not found')
            fromLatLon = new LatLng(data.locationFromLat, data.locationFromLon)
            // remove the walls from the area that the user is in
            const insideArea = toArea.floor.areas.find((area) => pointInPolygon(fromLatLon!, (area.shape as unknown as GeoJSON.Feature<GeoJSON.Polygon>).geometry.coordinates[0]))?.shape as unknown | undefined as GeoJSON.Feature<GeoJSON.Polygon> | undefined;
            if(insideArea) {
                ignorableWalls.push(...insideArea.geometry.coordinates[0].map(position => new LatLng(position[1], position[0])).map((latLng, i, arr) => new Wall(latLng, arr[(i + 1) % arr.length])))
            }
        }
        else {
            const fromArea = await ctx.prisma.area.findUnique({
                where: {
                    id: data.areaFromId,
                }
            })
            if (!fromArea || !fromArea.shape) throw throwGraphQLBadInput('From Area not found')
            if (fromArea.floorId !== toArea.floorId) throw throwGraphQLBadInput("Navigation between floors is not currently supported")
            const fromShape = fromArea.shape as unknown as GeoJSON.Feature<GeoJSON.Polygon>
            ignorableWalls.push(...fromShape.geometry.coordinates[0].map(position => new LatLng(position[1], position[0])).map((latLng, i, arr) => new Wall(latLng, arr[(i + 1) % arr.length])))
            fromLatLon = findPolygonCenter(fromShape)
        }

        const toLatLon = findPolygonCenter(toShape)

        if (!toLatLon || !fromLatLon) throw throwGraphQLBadInput('Issue with starting or ending GPS locations')

        let navMesh: NavMesh;
        let walls: Wall[] = [];
        let neededToGenerateANavMesh = false

        if (toArea.floor.navMesh === null) {
            neededToGenerateANavMesh = true;
            let [genNavMesh, genWalls] = generateNavMesh(toArea.floor);
            await prisma.floor.update({
                where: {
                    id: toArea.floor.id
                },
                data: {
                    navMesh: JSON.parse(JSON.stringify(genNavMesh)),
                    walls: JSON.parse(JSON.stringify(genWalls))
                }
            })
            navMesh = genNavMesh
            walls = genWalls
        }
        else {
            navMesh = (toArea.floor.navMesh as Prisma.JsonArray).map((navMeshVertex) => navMeshVertex as unknown as NavMeshVertex);
            walls = (toArea.floor.walls as Prisma.JsonArray).map((wall) => wall as unknown as Wall)
        }

        const wallsWithoutIgnorable = walls.filter(wall => {
            return ignorableWalls.findIndex((ignorableWall) => {
                return areWallsEqual(ignorableWall, wall)
            }) === -1
        })
        // findShortestPath also adds points on the nav mesh for the tromLatlon and the toLatLon. These points are added based on the edgesWithoutIgnorable so that they can go through the walls of their own building
        const shortestPath = findShortestPath(navMesh, wallsWithoutIgnorable, fromLatLon, toLatLon)
        return {
            path: shortestPath,
            walls: JSON.stringify(wallsWithoutIgnorable),
            // This converts an Edge (which is a navigatible connection) into a Wall becuase I had already written the wall dispalying code on the frontend and I wanted the edges to be in the same formate
            navMesh: JSON.stringify(navMesh.flatMap((vertex) => vertex.edges.flatMap(((edge) => new Wall(vertex.point, navMesh[edge.index].point))))),
            neededToGenerateANavMesh
        };
    }
}

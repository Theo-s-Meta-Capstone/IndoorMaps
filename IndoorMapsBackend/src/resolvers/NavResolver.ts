import { Arg, Ctx, Field, InputType, Int, ObjectType, Query, Resolver } from "type-graphql";

import { Context } from "../utils/context.js";
import { Wall, generateNavMesh } from "../navMesh/GenerateNavMesh.js";
import { LatLng } from "../graphqlSchemaTypes/Building.js";
import { areWallsEqual, findPolygonCenter } from "../navMesh/helpers.js";
import { findShortestPath } from "../navMesh/NavigateWithNavMesh.js";
import { throwGraphQLBadInput } from "../utils/generic.js";

@InputType()
class NavigationInput {
    @Field()
    areaFromId: number

    @Field()
    areaToId: number
}

@ObjectType()
class NavigationResult {
    @Field((type) => [LatLng]!)
    path: LatLng[]

    @Field()
    walls: string

    @Field()
    navMesh: string
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

        const fromArea = await ctx.prisma.area.findUnique({
            where: {
                id: data.areaFromId,
            }
        })

        if (!toArea || !toArea.shape) throw throwGraphQLBadInput('To Area not found')
        if (!fromArea || !fromArea.shape) throw throwGraphQLBadInput('From Area not found')
        if (fromArea.floorId !== toArea.floorId) throw throwGraphQLBadInput("Navigation between floors is not currently supported")

        const toShape = toArea.shape as unknown as GeoJSON.Feature<GeoJSON.Polygon>
        const fromShape = fromArea.shape as unknown as GeoJSON.Feature<GeoJSON.Polygon>
        const ignorableWalls = toShape.geometry.coordinates[0].map(position => new LatLng(position[1], position[0])).map((latLng, i, arr) => new Wall(latLng, arr[(i + 1) % arr.length]))
        ignorableWalls.push(...fromShape.geometry.coordinates[0].map(position => new LatLng(position[1], position[0])).map((latLng, i, arr) => new Wall(latLng, arr[(i + 1) % arr.length])))
        const toLatLon = findPolygonCenter(toShape)
        const fromLatLon = findPolygonCenter(fromShape)

        if(!toLatLon || !fromLatLon) throw throwGraphQLBadInput('Issue with starting or ending GPS locations')
        let [navMesh, walls] = generateNavMesh(toArea.floor);
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
            navMesh: JSON.stringify(navMesh.flatMap((vertex) => vertex.edges.flatMap(((edge) => new Wall(vertex.point, edge.otherVertex.point)))))
        };
    }
}

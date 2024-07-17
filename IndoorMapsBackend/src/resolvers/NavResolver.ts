import { Arg, Ctx, Field, InputType, Int, ObjectType, Query, Resolver } from "type-graphql";

import { Context } from "../utils/context.js";
import { Edge, generateNavMesh } from "../navMesh/GenerateNavMesh.js";
import { LatLng } from "../graphqlSchemaTypes/Building.js";
import { areEdgesEqual, findPolygonCenter } from "../navMesh/helpers.js";
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
    edges: string

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
        const ignorableEdges = toShape.geometry.coordinates[0].map(position => new LatLng(position[1], position[0])).map((latLng, i, arr) => new Edge(latLng, arr[(i + 1) % arr.length]))
        ignorableEdges.push(...fromShape.geometry.coordinates[0].map(position => new LatLng(position[1], position[0])).map((latLng, i, arr) => new Edge(latLng, arr[(i + 1) % arr.length])))
        const toLatLon = findPolygonCenter(toShape)
        const fromLatLon = findPolygonCenter(fromShape)

        if(!toLatLon || !fromLatLon) throw throwGraphQLBadInput('Issue with starting or ending GPS locations')
        let [navMesh, edges] = generateNavMesh(toArea.floor);
        const edgesWithoutIgnorable = edges.filter(edge => {
            return ignorableEdges.findIndex((ignorableEdge) => {
                return areEdgesEqual(ignorableEdge, edge)
            }) === -1
        })
        // findShortestPath also adds points on the nav mesh for the tromLatlon and the toLatLon. These points are added based on the edgesWithoutIgnorable so that they can go through the walls of their own building
        const shortestPath = findShortestPath(navMesh, edgesWithoutIgnorable, fromLatLon, toLatLon)
        return {
            path: shortestPath,
            edges: JSON.stringify(edgesWithoutIgnorable),
            navMesh: JSON.stringify(navMesh.flatMap((vertex) => vertex.edges.flatMap(((edge) => new Edge(vertex.point, edge.otherVertex.point)))))
        };
    }
}

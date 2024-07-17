import { Arg, Ctx, Field, InputType, Int, ObjectType, Query, Resolver } from "type-graphql";
import { GraphQLError } from "graphql";

import { Context } from "../utils/context.js";
import { generateNavMesh } from "../navMesh/GenerateNavMesh.js";
import { LatLng } from "../graphqlSchemaTypes/Building.js";
import { findPolygonCenter, findshortestPath } from "../navMesh/helpers.js";

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

        if (!toArea || !toArea.shape) {
            throw new GraphQLError('To Area not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        if (!fromArea || !fromArea.shape) {
            throw new GraphQLError('From Area not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        const toLatLon = findPolygonCenter(toArea.shape as unknown as GeoJSON.Feature)
        const fromLatLon = findPolygonCenter(fromArea.shape as unknown as GeoJSON.Feature)
        if(!toLatLon || !fromLatLon) {
            throw new GraphQLError('Issue with starting or ending GPS locations', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        let [navMesh, edges] = generateNavMesh(toArea.floor);

        return {
            path: findshortestPath(navMesh, edges, fromLatLon, toLatLon),
        };
    }
}

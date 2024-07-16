import { Arg, Ctx, Field, InputType, Int, ObjectType, Query, Resolver } from "type-graphql";
import { GraphQLError } from "graphql";

import { Context } from "../utils/context.js";
import { generateNavMesh } from "../navMesh/GenerateNavMesh.js";
import { LatLng } from "../graphqlSchemaTypes/Building.js";

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
    @Query((returns) => Number)
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
        if (!toArea) {
            throw new GraphQLError('To Area not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        generateNavMesh(toArea.floor)
        return {
            path: [],
        };
    }
}

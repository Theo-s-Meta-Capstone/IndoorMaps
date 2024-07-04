import 'reflect-metadata'
import { Resolver, Query, Mutation, Arg, Ctx, InputType, Field, FieldResolver, Root, Float} from 'type-graphql'
import { GraphQLError } from 'graphql'
import { Floor as DbFloor } from '@prisma/client'

import { Context } from '../utils/context.js'
import { Building } from '../graphqlSchemaTypes/Building.js'
import { convertToGraphQLBuilding, convertToGraphQLFloor } from '../utils/typeConversions.js'
import { getUserOrThrowError } from '../auth/validateUser.js'
import { Floor } from '../graphqlSchemaTypes/Floor.js'

@InputType()
class BuildingUniqueInput {
    @Field()
    id: number
}

@InputType()
class BuildingCreateInput {
    @Field()
    title: string

    @Field()
    address: string

    @Field(type => Float)
    startLat: number

    @Field(type => Float)
    startLon: number
}

@Resolver(of => Building)
export class BuildingResolver {
    @FieldResolver((type) => [Floor]!)
    async floors(
        @Root() building: Building,
        @Ctx() ctx: Context,
    ) {
        //TODO: investigate why using findUnique throws a error
        const dbFloors = await ctx.prisma.building.findFirst({
            where: {
                id: building.databaseId
            },
            select: {
                floors: { orderBy: { id: 'asc' } }
            },
        });
        if (!dbFloors) {
            throw new GraphQLError('Building not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        return dbFloors.floors.map((value: DbFloor) => convertToGraphQLFloor(value))
    }

    @Mutation((returns) => Building)
    async createBuilding(
        @Arg('data') data: BuildingCreateInput,
        @Ctx() ctx: Context,
    ): Promise<Building> {
        const user = await getUserOrThrowError(ctx.cookies);

        const newBuilding = await ctx.prisma.building.create({
            data: {
                title: data.title,
                address: data.address,
                startLat: data.startLat,
                startLon: data.startLon,
                editors: {
                    create: {
                        editorLevel: "owner",
                        user: {
                            connect: {
                                id: user.databaseId,
                            },
                        },
                    },
                },
            }
        });
        return convertToGraphQLBuilding(newBuilding);
    }

    @Query((returns) => Building)
    async getBuilding(
        @Arg('data') data: BuildingUniqueInput,
        @Ctx() ctx: Context,
    ): Promise<Building> {
        const dbBuilding = await ctx.prisma.building.findUnique({
            where: {
                id: data.id,
            },
        })
        if (!dbBuilding) {
            throw new GraphQLError('Building not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        return convertToGraphQLBuilding(dbBuilding);
    }

    @Query(() => [Building])
    async allBuildings(@Ctx() ctx: Context) {
        const buildings = await ctx.prisma.building.findMany({
            include: {
                floors: true
            }
        });
        return buildings.map((building) => convertToGraphQLBuilding(building))
    }

}
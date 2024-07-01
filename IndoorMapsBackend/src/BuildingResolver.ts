import 'reflect-metadata'
import {
    Resolver,
    Query,
    Mutation,
    Arg,
    Ctx,
    InputType,
    Field,
    Int,
    FieldResolver,
    Root
} from 'type-graphql'
import { Context } from './context.js'
import { GraphQLError } from 'graphql'
import { Building, Floor } from './Building.js'
import { convertToGraphQLBuilding } from './utils/typeConversions.js'
import { Floor as DbFloor } from '@prisma/client'


@InputType()
class BuildingUniqueInput {
    @Field({ nullable: true })
    id: number
}

@InputType()
class BuildingCreateInput {
    @Field()
    title: string

    @Field()
    description: string

    @Field((type) => Int, { description: "the creater's user id" })
    owner: number
}

@Resolver(Building)
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
                floors: true
            }
        });
        if (!dbFloors) {
            throw new GraphQLError('Building not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        return dbFloors.floors.map((value: DbFloor) => {
            return {
                ...value,
                id: "floor" + value.id.toString()
            }
        })
    }

    @Mutation((returns) => Building)
    async createBuilding(
        @Arg('data') data: BuildingCreateInput,
        @Ctx() ctx: Context,
    ): Promise<Building> {
        // TODO: only get the floors and areas if needed
        // Use prisma to get building
        const newBuilding = await ctx.prisma.building.create({
            data: {
                title: data.title,
                description: data.description,
                editors: {
                    create: {
                        editorLevel: "owner",
                        user: {
                            connect: {
                                id: data.owner,
                            },
                        },
                    },
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                floors: true,
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
            select: {
                id: true,
                title: true,
                description: true,
                floors: true,
            }
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
            select: {
                id: true,
                title: true,
                description: true,
                floors: true,
            }
        });
        return buildings.map((building) => convertToGraphQLBuilding(building))
    }

}

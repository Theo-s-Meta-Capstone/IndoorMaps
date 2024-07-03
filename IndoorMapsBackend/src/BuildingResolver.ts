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
    Root,
    Float
} from 'type-graphql'
import { Context } from './context.js'
import { GraphQLError } from 'graphql'
import { Building, Floor } from './Building.js'
import { convertToGraphQLBuilding, convertToGraphQLFloor } from './utils/typeConversions.js'
import { Floor as DbFloor } from '@prisma/client'
import { validateUser } from './auth/validateUser.js'
import { NewFloorResult } from './User.js'


@InputType()
class BuildingUniqueInput {
    @Field()
    id: number
}

@InputType()
class FloorUniqueInput {
    @Field(type => Int)
    id: number
}

@InputType()
class NewShape {
    @Field({ nullable: true })
    shape: string
}

@InputType()
class FloorModifyInput extends FloorUniqueInput {
    @Field({ nullable: true })
    title?: string

    @Field({ nullable: true })
    description?: string

    // because a shape can be null, I added 2 layers of nullable. The first layer specifies whether the shape should be updated and the seccond specified the new shape value (which is possibly null)
    @Field(type => NewShape, { nullable: true, description: "If New Shape is null there is no update, otherwise shape is updated to the shape inside of NewShape" })
    newShape?: NewShape
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

@InputType()
class FloorCreateInput {
    @Field()
    title: string

    @Field()
    description: string

    @Field(type => Int)
    buildingDatabseId: number
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
        const user = await validateUser(ctx.cookies);
        if (!user) {
            throw new GraphQLError('User not signed in', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
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

    @Mutation((returns) => NewFloorResult)
    async createFloor(
        @Arg('data') data: FloorCreateInput,
        @Ctx() ctx: Context,
    ): Promise<NewFloorResult> {
        const user = await validateUser(ctx.cookies);
        if (!user) {
            throw new GraphQLError('User not signed in', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        const newFloor = await ctx.prisma.floor.create({
            data: {
                title: data.title,
                description: data.description,
                building: {
                    connect: {
                        id: data.buildingDatabseId,
                    },
                },
            },
        });

        return {
            success: true,
            databaseId: newFloor.id,
            buildingDatabaseId: data.buildingDatabseId
        };
    }

    @Mutation((returns) => NewFloorResult)
    async modifyFloor(
        @Arg('data') data: FloorModifyInput,
        @Ctx() ctx: Context,
    ): Promise<NewFloorResult> {
        const user = await validateUser(ctx.cookies);
        if (!user) {
            throw new GraphQLError('User not signed in', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        const updatedFloor = await ctx.prisma.floor.update({
            where: {
                id: data.id
            },
            data: {
                description: data.description,
                title: data.title,
                shape: data.newShape !== undefined ? data.newShape.shape : undefined
            },
            select: {
                id: true,
                buildingId: true,
                title: true,
                description: true,
                shape: true
            }
        });
        return {
            success: true,
            databaseId: updatedFloor.id,
            buildingDatabaseId: updatedFloor.buildingId
        };
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

    @Query((returns) => Floor)
    async getFloor(
        @Arg('data') data: FloorUniqueInput,
        @Ctx() ctx: Context,
    ): Promise<Floor> {
        const dbFloor = await ctx.prisma.floor.findUnique({
            where: {
                id: data.id,
            }
        })
        if (!dbFloor) {
            throw new GraphQLError('Floor not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        return convertToGraphQLFloor(dbFloor);
    }

    @Query(() => [Building])
    async allBuildings(@Ctx() ctx: Context) {
        const buildings = await ctx.prisma.building.findMany({
            select: {
                id: true,
                title: true,
                address: true,
                startLat: true,
                startLon: true,
                floors: true,
            }
        });
        return buildings.map((building) => convertToGraphQLBuilding(building))
    }

}

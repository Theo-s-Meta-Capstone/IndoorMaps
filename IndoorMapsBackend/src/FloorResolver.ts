import { Arg, Ctx, Field, FieldResolver, InputType, Int, Mutation, Query, Resolver, Root } from "type-graphql";
import { GraphQLError } from "graphql";

import { Area, Floor, NewFloorResult } from "./Building.js";
import { Context } from "./context.js";
import { convertToGraphQLFloor, convertToGraphQlArea } from "./utils/typeConversions.js";
import { getUserOrThrowError } from "./auth/validateUser.js";

@InputType()
class FloorCreateInput {
    @Field()
    title: string

    @Field()
    description: string

    @Field(type => Int)
    buildingDatabseId: number
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

@Resolver(of => Floor)
export class FloorResolver {
    @FieldResolver((type) => [Area]!)
    async areas(
        @Root() floor: Floor,
        @Ctx() ctx: Context,
    ) {
        //TODO: investigate why using findUnique throws a error
        const dbAreas = await ctx.prisma.floor.findFirst({
            where: {
                id: floor.databaseId
            },
            select: {
                areas: { orderBy: { id: 'asc' } }
            },
        });
        if (!dbAreas) {
            throw new GraphQLError('Floor not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        return dbAreas.areas.map((value) => convertToGraphQlArea(value))
    }

    @Mutation((returns) => NewFloorResult)
    async modifyFloor(
        @Arg('data') data: FloorModifyInput,
        @Ctx() ctx: Context,
    ): Promise<NewFloorResult> {
        const user = await getUserOrThrowError(ctx.cookies);
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
            }
        });
        return {
            success: true,
            databaseId: updatedFloor.id,
            buildingDatabaseId: updatedFloor.buildingId
        };
    }

    @Mutation((returns) => NewFloorResult)
    async createFloor(
        @Arg('data') data: FloorCreateInput,
        @Ctx() ctx: Context,
    ): Promise<NewFloorResult> {
        const user = await getUserOrThrowError(ctx.cookies);
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
}

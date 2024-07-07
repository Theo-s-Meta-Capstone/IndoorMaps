import { InputType, Field, Int, Resolver, Mutation, Arg, Ctx, Query } from "type-graphql"
import { getUserOrThrowError } from "../auth/validateUser.js"
import { Context } from "../utils/context.js"
import { Area, NewAreaResult } from "../graphqlSchemaTypes/Area.js"
import { convertToGraphQlArea } from "../utils/typeConversions.js"
import { GraphQLError } from "graphql"
import { NewShape } from "./FloorResolver.js"

@InputType()
class AreaCreateInput {
    @Field(type => Int)
    floorDatabseId: number

    @Field()
    title: string

    @Field()
    description: string

    @Field()
    shape: string

    @Field({ nullable: true })
    category: string
}

@InputType()
class AreaUniqueInput {
    @Field(type => Int)
    id: number
}

@InputType()
class AreaModifyInput extends AreaUniqueInput {
    @Field({ nullable: true })
    title?: string

    @Field({ nullable: true })
    description?: string

    @Field({ nullable: true })
    shape?: string

    @Field({ nullable: true })
    category?: string

    // because a shape can be null, I added 2 layers of nullable. The first layer specifies whether the shape should be updated and the seccond specified the new shape value (which is possibly null)
    @Field(type => NewShape, { nullable: true, description: "If New Shape is null there is no update, otherwise shape is updated to the shape inside of NewShape" })
    entrances?: NewShape
}

@Resolver(of => Area)
export class AreaResolver {
    @Mutation((returns) => NewAreaResult)
    async createArea(
        @Arg('data') data: AreaCreateInput,
        @Ctx() ctx: Context,
    ): Promise<NewAreaResult> {
        // TODO: check if user is alowed to edit this building
        await getUserOrThrowError(ctx.cookies);
        const newArea = await ctx.prisma.area.create({
            data: {
                title: data.title,
                description: data.description,
                shape: JSON.parse(data.shape),
                traversable: false,
                category: data.category ? data.category : "",
                floor: {
                    connect: {
                        id: data.floorDatabseId,
                    },
                },
            },
        });
        return {
            success: true,
            databaseId: newArea.id,
            floorDatabaseId: data.floorDatabseId
        };
    }

    @Mutation((returns) => NewAreaResult)
    async modifyArea(
        @Arg('data') data: AreaModifyInput,
        @Ctx() ctx: Context,
    ): Promise<NewAreaResult> {
        await getUserOrThrowError(ctx.cookies);
        const updatedArea = await ctx.prisma.area.update({
            where: {
                id: data.id
            },
            data: {
                ...data,
                shape: data.shape !== undefined ? JSON.parse(data.shape) : undefined,
                entrances: data.entrances !== undefined ? JSON.parse(data.entrances.shape) : undefined
            },
            select: {
                id: true,
                floorId: true,
            }
        });
        return {
            success: true,
            databaseId: updatedArea.id,
            floorDatabaseId: updatedArea.floorId
        };
    }

    @Mutation((returns) => NewAreaResult)
    async deleteArea(
        @Arg('data') data: AreaUniqueInput,
        @Ctx() ctx: Context,
    ): Promise<NewAreaResult> {
        await getUserOrThrowError(ctx.cookies);
        const updatedArea = await ctx.prisma.area.delete({
            where: {
                id: data.id
            },
        });
        return {
            success: true,
            databaseId: updatedArea.id,
            floorDatabaseId: updatedArea.floorId
        };
    }

    @Query((returns) => Area)
    async getArea(
        @Arg('data') data: AreaUniqueInput,
        @Ctx() ctx: Context,
    ): Promise<Area> {
        const dbArea = await ctx.prisma.area.findUnique({
            where: {
                id: data.id,
            }
        })
        if (!dbArea) {
            throw new GraphQLError('Floor not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        return convertToGraphQlArea(dbArea);
    }
}

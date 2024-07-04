import { InputType, Field, Int, Resolver, Mutation, Arg, Ctx, Query } from "type-graphql"
import { getUserOrThrowError } from "../auth/validateUser.js"
import { Context } from "../utils/context.js"
import { Area, NewAreaResult } from "../graphqlSchemaTypes/Area.js"
import { convertToGraphQlArea } from "../utils/typeConversions.js"
import { GraphQLError } from "graphql"

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
                shape: data.shape,
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
                ...data
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

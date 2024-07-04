import { InputType, Field, Int, Resolver, Mutation, Arg, Ctx } from "type-graphql"
import { Area, Floor, NewAreaResult } from "./Building.js"
import { getUserOrThrowError } from "./auth/validateUser.js"
import { Context } from "./context.js"

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
    title: string

    @Field({ nullable: true })
    description: string

    @Field(type => Int, { nullable: true })
    floorDatabseId: number

    @Field({ nullable: true })
    shape: string

    @Field({ nullable: true })
    category: string
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
}

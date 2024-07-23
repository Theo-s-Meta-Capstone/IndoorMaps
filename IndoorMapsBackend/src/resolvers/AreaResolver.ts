import { InputType, Field, Int, Resolver, Mutation, Arg, Ctx, Query } from "type-graphql"
import { checkAuthrizedAreaEditor, checkAuthrizedFloorEditor, getUserOrThrowError } from "../auth/validateUser.js"
import { Context } from "../utils/context.js"
import { Area, NewAreaResult } from "../graphqlSchemaTypes/Area.js"
import { convertToGraphQlArea } from "../utils/typeConversions.js"
import { NewShape, deleteNavMesh } from "./FloorResolver.js"
import { throwGraphQLBadInput } from "../utils/generic.js"

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

    @Field()
    buildingDatabaseId: number
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

    @Field(type => Boolean, { nullable: true })
    traversable?: boolean

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
        const authError = await checkAuthrizedFloorEditor(data.floorDatabseId, ctx);
        if (authError) {
            throw authError;
        }
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
                building: {
                    connect: {
                        id: data.buildingDatabaseId
                    }
                }
            },
        });
        await deleteNavMesh(newArea.floorId);
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
        const authError = await checkAuthrizedAreaEditor(data.id, ctx);
        if (authError) {
            throw authError;
        }
        const updatedArea = await ctx.prisma.area.update({
            where: {
                id: data.id
            },
            data: {
                ...data,
                shape: data.shape !== undefined ? JSON.parse(data.shape) : undefined,
                entrances: data.entrances !== undefined ? JSON.parse(data.entrances.shape) : undefined,
                traversable: data.traversable !== undefined ? data.traversable : undefined,
            },
            select: {
                id: true,
                floorId: true,
            }
        });
        await deleteNavMesh(updatedArea.floorId);
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
        const authError = await checkAuthrizedAreaEditor(data.id, ctx);
        if (authError) {
            throw authError;
        }
        const updatedArea = await ctx.prisma.area.delete({
            where: {
                id: data.id
            },
        });
        await deleteNavMesh(updatedArea.floorId);
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
        if (!dbArea) throw throwGraphQLBadInput('Floor not found')
        return convertToGraphQlArea(dbArea);
    }
}

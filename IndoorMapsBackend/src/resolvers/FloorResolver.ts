import { Arg, Ctx, Field, FieldResolver, Float, InputType, Int, Mutation, Query, Resolver, Root } from "type-graphql";

import { Context, prisma } from "../utils/context.js";
import { convertToGraphQLFloor, convertToGraphQlArea } from "../utils/typeConversions.js";
import { checkAuthrizedBuildingEditor, checkAuthrizedFloorEditor } from "../auth/validateUser.js";
import { Floor, NewFloorResult } from "../graphqlSchemaTypes/Floor.js";
import { Area } from "../graphqlSchemaTypes/Area.js";
import { throwGraphQLBadInput } from "../utils/generic.js";
import { Prisma } from "@prisma/client";
import { invalidateCache } from "../utils/redisCache.js";

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
export class NewShape {
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

    @Field({ nullable: true })
    guideImage?: string

    @Field(type => NewShape, { nullable: true })
    newGuideImageShape?: NewShape

    @Field(type => Float, { nullable: true })
    guideImageRotation?: number
}

export const deleteNavMesh = async (floorDatabaseId: number) => {
    await prisma.floor.update({
        where: {
            id: floorDatabaseId
        },
        data: {
            navMesh: Prisma.DbNull,
            walls: Prisma.DbNull,
            voronoiNavMesh: Prisma.DbNull,
            floorPerimeterWalls: Prisma.DbNull,
        }
    })
    invalidateCache("floor"+floorDatabaseId);
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
            throw throwGraphQLBadInput('Floor not found')
        }
        return dbAreas.areas.map((value) => convertToGraphQlArea(value))
    }

    @Mutation((returns) => Floor)
    async modifyFloor(
        @Arg('data') data: FloorModifyInput,
        @Ctx() ctx: Context,
    ): Promise<Floor> {
        const authError = await checkAuthrizedFloorEditor(data.id, ctx);
        if (authError) {
            throw authError;
        }
        const updatedFloor = await ctx.prisma.floor.update({
            where: {
                id: data.id
            },
            data: {
                description: data.description,
                title: data.title,
                shape: data.newShape !== undefined ? JSON.parse(data.newShape.shape) : undefined,
                guideImage: data.guideImage,
                guideImageShape: data.newGuideImageShape !== undefined ? JSON.parse(data.newGuideImageShape.shape) : undefined,
                guideImageRotation: data.guideImageRotation,
            },
        });
        await deleteNavMesh(data.id);
        return convertToGraphQLFloor(updatedFloor);
    }

    @Mutation((returns) => NewFloorResult)
    async createFloor(
        @Arg('data') data: FloorCreateInput,
        @Ctx() ctx: Context,
    ): Promise<NewFloorResult> {
        const authError = await checkAuthrizedBuildingEditor(data.buildingDatabseId, ctx);
        if (authError) {
            throw authError;
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
            throw throwGraphQLBadInput('Floor not found');
        }
        return convertToGraphQLFloor(dbFloor);
    }
}

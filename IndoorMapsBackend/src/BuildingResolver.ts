import 'reflect-metadata'
import {
    Resolver,
    Query,
    Mutation,
    Arg,
    Ctx,
    InputType,
    Field,
} from 'type-graphql'
import { Context } from './context.js'
import { Building } from './Building.js'
import { GraphQLError } from 'graphql'
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

    @Field({description: "the creater's user id"})
    owner: number
}

@Resolver(Building)
export class BuildingResolver {
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
        });

        const Building: Building = {
            id: newBuilding.id,
            title: newBuilding.title,
            description: newBuilding.description,
            // new buildings have no floors by defualt
            floors: [],
        }
        return newBuilding as Building;
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
        return dbBuilding;
    }

    @Query(() => [Building])
    async allBuildings(@Ctx() ctx: Context) {
        return ctx.prisma.building.findMany()
    }

}

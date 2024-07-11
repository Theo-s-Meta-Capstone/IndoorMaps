import 'reflect-metadata'
import { Resolver, Query, Mutation, Arg, Ctx, InputType, Field, FieldResolver, Root, Float, Subscription, Int, Directive } from 'type-graphql'
import { GraphQLError } from 'graphql'
import { Floor as DbFloor, Building as DbBuilding } from '@prisma/client'

import { Context } from '../utils/context.js'
import { Building } from '../graphqlSchemaTypes/Building.js'
import { convertToGraphQLBuilding, convertToGraphQLFloor } from '../utils/typeConversions.js'
import { checkAuthrizedBuildingEditor, getUserOrThrowError } from '../auth/validateUser.js'
import { Floor } from '../graphqlSchemaTypes/Floor.js'
import { MutationResult } from '../utils/generic.js'
import { LiveLocation, pubSub } from './pubSub.js'

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

@InputType()
class InviteEditorInput extends BuildingUniqueInput {
    @Field()
    invitedUser: string
}

@InputType()
class AreaSearchInput {
    @Field()
    query: string
}

@InputType()
class LiveLocationInput extends BuildingUniqueInput {
    @Field(() => Float)
    latitude: number;

    @Field(() => Float)
    longitude: number;

    @Field()
    name: string;

    @Field()
    message: string;
}

@InputType()
class BuildingSearchInput {
    @Field({ nullable: true })
    searchQuery: string
}

@Resolver(of => Building)
export class BuildingResolver {
    @FieldResolver((type) => [Floor]!)
    async floors(
        @Root() building: Building,
        @Ctx() ctx: Context,
    ): Promise<Floor[]> {
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

    @Mutation((returns) => MutationResult)
    async inviteEditor(
        @Arg('data') data: InviteEditorInput,
        @Ctx() ctx: Context,
    ): Promise<MutationResult> {
        const authError = await checkAuthrizedBuildingEditor(data.id, ctx);
        if (authError) {
            throw authError;
        }

        const userToInvite = await ctx.prisma.user.findFirst({
            where: {
                email: data.invitedUser,
            },
        })
        if (userToInvite === null) {
            throw new GraphQLError('User to invite is not signed up', {
                extensions: {
                    code: 'USER_TO_INVITE_NOT_FOUND',
                },
            });
        }

        await ctx.prisma.buildingEditors.create({
            data: {
                editorLevel: "editor",
                user: {
                    connect: {
                        email: data.invitedUser,
                    },
                },
                building: {
                    connect: {
                        id: data.id,
                    }
                }
            }
        });
        return {
            success: true,
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

    @Query(() => [Building])
    async allBuildings(
        @Arg('data') data: BuildingSearchInput,
        @Ctx() ctx: Context
    ): Promise<Building[]> {
        let buildings;
        if (data.searchQuery && data.searchQuery.length > 0) {
            buildings = await ctx.prisma.building.findMany({
                where: {
                    OR: [
                        {
                            title: {
                                contains: data.searchQuery,
                                mode: 'insensitive',
                            }
                        },
                        {
                            address: {
                                contains: data.searchQuery,
                                mode: 'insensitive',
                            }
                        }
                    ],
                }
            });
        } else {
            buildings = await ctx.prisma.building.findMany({});
        }
        return buildings.map((building) => convertToGraphQLBuilding(building))
    }

    @Mutation((returns) => MutationResult)
    async setLocation(
        @Arg('data') data: LiveLocationInput,
        @Ctx() ctx: Context,
    ): Promise<MutationResult> {
        const user = await getUserOrThrowError(ctx.cookies);
        pubSub.publish("LIVELOCATIONS", {
            id: "liveLocation" + user.databaseId,
            buildingDatabaseId: data.id,
            latitude: data.latitude,
            longitude: data.longitude,
            name: data.name,
            message: data.message,
        });
        return {
            success: true,
        };
    }

    @Subscription((returns) => LiveLocation, {
        topics: "LIVELOCATIONS",
        filter: ({ payload, args }) =>{
            return payload.buildingDatabaseId === args.data.id
        },
    })
    async newLiveLocation(
        @Arg('data') data: BuildingUniqueInput,
        @Root() liveLocaiton: LiveLocation,
    ): Promise<LiveLocation> {
        return {
            ...liveLocaiton,
        };
    }

    @Query((type) => String)
    async areaSearch(
        @Arg('data') data: AreaSearchInput,
        @Ctx() ctx: Context,
    ): Promise<String> {
        console.log(data)
        return data.query
    }
}

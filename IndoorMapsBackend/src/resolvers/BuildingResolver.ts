import "reflect-metadata";
import {
    Directive,
    Resolver,
    Query,
    Mutation,
    Arg,
    Ctx,
    InputType,
    Field,
    FieldResolver,
    Root,
    Float,
    Subscription,
    Int,
} from "type-graphql";
import { Floor as DbFloor } from "@prisma/client";

import { Context } from "../utils/context.js";
import { Building } from "../graphqlSchemaTypes/Building.js";
import {
    convertToGraphQLBuilding,
    convertToGraphQLBuildingGroup,
    convertToGraphQLFloor,
    convertToGraphQlArea,
    convertToGraphQlAreaWithFloorTitle,
} from "../utils/typeConversions.js";
import {
    checkAuthrizedBuildingEditor,
    getUserOrThrowError,
} from "../auth/validateUser.js";
import { Floor } from "../graphqlSchemaTypes/Floor.js";
import { MutationResult, throwGraphQLBadInput } from "../utils/generic.js";
import { LiveLocation, pubSub } from "./pubSub.js";
import { Area } from "../graphqlSchemaTypes/Area.js";
import { BuildingGroup } from "../graphqlSchemaTypes/BuildingGroup.js";

function formatSearchQuery(query: string) {
    return query.trim().replaceAll(" ", ":*|") + ":*";
}

@InputType()
class BuildingUniqueInput {
    @Field()
    id: number;
}

@InputType()
class BuildingGroupUniqueInput {
    @Field(type => Int)
    id: number;

    @Field({nullable: true})
    buildingSearch?: string;
}

@InputType()
class BuildingCreateInput {
    @Field()
    title: string;

    @Field()
    address: string;

    @Field((type) => Float)
    startLat: number;

    @Field((type) => Float)
    startLon: number;
}

@InputType()
class BuildingUpdateInput {
    @Field((type) => Int)
    buildingDatabseId: number;

    @Field()
    title: string;

    @Field()
    address: string;

    @Field((type) => Float)
    startLat: number;

    @Field((type) => Float)
    startLon: number;
}

@InputType()
class InviteEditorInput extends BuildingUniqueInput {
    @Field()
    invitedUser: string;
}

@InputType()
class AreaSearchInput extends BuildingUniqueInput {
    @Field()
    query: string;
}

@InputType()
class ConnectBuildingToBuildingGroup extends BuildingUniqueInput {
    @Field((type) => Int, { nullable: true })
    buildingGroupDatabaseId?: number;
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
    searchQuery: string;
}

@InputType()
class CreateBuildingGroup {
    @Field()
    name: string;
}

@Resolver((of) => Building)
export class BuildingResolver {
    @FieldResolver((type) => [Floor]!)
    async floors(
        @Root() building: Building,
        @Ctx() ctx: Context
    ): Promise<Floor[]> {
        //TODO: investigate why using findUnique throws a error
        const dbFloors = await ctx.prisma.building.findFirst({
            where: {
                id: building.databaseId,
            },
            select: {
                floors: { orderBy: { id: "asc" } },
            },
        });
        if (!dbFloors) {
            throw throwGraphQLBadInput("Building not found");
        }
        return dbFloors.floors.map((value: DbFloor) =>
            convertToGraphQLFloor(value)
        );
    }

    @Mutation((returns) => Building)
    async createBuilding(
        @Arg("data") data: BuildingCreateInput,
        @Ctx() ctx: Context
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
            },
        });
        return convertToGraphQLBuilding(newBuilding);
    }

    @Mutation((returns) => Building)
    async updateBuilding(
        @Arg("data") data: BuildingUpdateInput,
        @Ctx() ctx: Context
    ): Promise<Building> {
        const authError = await checkAuthrizedBuildingEditor(
            data.buildingDatabseId,
            ctx
        );
        if (authError) {
            throw authError;
        }
        const editedBuilding = await ctx.prisma.building.update({
            where: {
                id: data.buildingDatabseId,
            },
            data: {
                title: data.title,
                address: data.address,
                startLat: data.startLat,
                startLon: data.startLon,
            },
        });
        return convertToGraphQLBuilding(editedBuilding);
    }

    @Mutation((returns) => MutationResult)
    async inviteEditor(
        @Arg("data") data: InviteEditorInput,
        @Ctx() ctx: Context
    ): Promise<MutationResult> {
        const authError = await checkAuthrizedBuildingEditor(data.id, ctx);
        if (authError) {
            throw authError;
        }

        const userToInvite = await ctx.prisma.user.findFirst({
            where: {
                email: data.invitedUser,
            },
        });
        if (userToInvite === null) {
            throw throwGraphQLBadInput("User to invite is not signed up");
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
                    },
                },
            },
        });
        return {
            success: true,
        };
    }

    @Query((returns) => Building)
    async getBuilding(
        @Arg("data") data: BuildingUniqueInput,
        @Ctx() ctx: Context
    ): Promise<Building> {
        const dbBuilding = await ctx.prisma.building.findUnique({
            where: {
                id: data.id,
            },
        });
        if (!dbBuilding) {
            throw throwGraphQLBadInput("Building not found");
        }
        return convertToGraphQLBuilding(dbBuilding);
    }

    @Query((returns) => BuildingGroup)
    async getBuildingGroup(
        @Arg("data") data: BuildingGroupUniqueInput,
        @Ctx() ctx: Context
    ): Promise<BuildingGroup> {
        let dbBuildingGroup;
        if(data.buildingSearch != undefined && data.buildingSearch != null && data.buildingSearch.trim().length > 0) {
            const query = formatSearchQuery(data.buildingSearch);
            dbBuildingGroup = await ctx.prisma.buildingGroup.findUnique({
                where: {
                    id: data.id,
                },
                include: {
                    buildings: {
                        where: {
                            title: {
                                search: query
                            },
                            address: {
                                search: query
                            }
                        }
                    }
                }
            })
        } else {
            dbBuildingGroup = await ctx.prisma.buildingGroup.findUnique({
                where: {
                    id: data.id,
                },
                include: {
                    buildings: true
                }
            })
        }
        if (!dbBuildingGroup) {
            throw throwGraphQLBadInput("Building Group not found");
        }
        return convertToGraphQLBuildingGroup(dbBuildingGroup);
    }

    @Directive('@deprecated(reason: "Use allBuildingGroups")')
    @Query(() => [Building])
    async allBuildings(
        @Arg("data") data: BuildingSearchInput,
        @Ctx() ctx: Context
    ): Promise<Building[]> {
        let buildings;
        if (data.searchQuery && data.searchQuery.trim().length > 0) {
            const query = formatSearchQuery(data.searchQuery);
            buildings = await ctx.prisma.building.findMany({
                where: {
                    address: {
                        search: query,
                    },
                    title: {
                        search: query,
                    },
                },
            });
        } else {
            buildings = await ctx.prisma.building.findMany({});
        }
        return buildings.map((building) => convertToGraphQLBuilding(building));
    }

    @Query(() => [BuildingGroup])
    async allBuildingGroups(
        @Arg("data") data: BuildingSearchInput,
        @Ctx() ctx: Context
    ): Promise<BuildingGroup[]> {
        let buildingGroups;
        if (data.searchQuery && data.searchQuery.trim().length > 0) {
            const query = formatSearchQuery(data.searchQuery);
            buildingGroups = await ctx.prisma.buildingGroup.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                search: query,
                            },
                        },
                        {
                            buildings: {
                                some: {
                                    title: {
                                        search: query,
                                    },
                                    address: {
                                        search: query,
                                    },
                                },
                            },
                        },
                    ],
                },
                include: {
                    buildings: true,
                },
            });
        } else {
            buildingGroups = await ctx.prisma.buildingGroup.findMany({
                include: {
                    buildings: true,
                },
            });
        }
        return buildingGroups.map((buildingGroup) =>
            convertToGraphQLBuildingGroup(buildingGroup)
        );
    }

    @Mutation((returns) => MutationResult)
    async setLocation(
        @Arg("data") data: LiveLocationInput,
        @Ctx() ctx: Context
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
        filter: ({ payload, args }) => {
            return payload.buildingDatabaseId === args.data.id;
        },
    })
    async newLiveLocation(
        @Arg("data") data: BuildingUniqueInput,
        @Root() liveLocaiton: LiveLocation
    ): Promise<LiveLocation> {
        return {
            ...liveLocaiton,
        };
    }

    @Query((type) => [Area]!)
    async areaSearch(
        @Arg("data") data: AreaSearchInput,
        @Ctx() ctx: Context
    ): Promise<Area[]> {
        if (data.query.trim().length === 0) {
            return [];
        }
        const query = formatSearchQuery(data.query);
        const building = await ctx.prisma.building.findUnique({
            where: {
                id: data.id,
            },
            select: {
                areas: {
                    where: {
                        description: {
                            search: query,
                        },
                        title: {
                            search: query,
                        },
                    },
                    include: {
                        floor: {
                            select: {
                                title: true,
                            },
                        },
                    },
                },
            },
        });
        if (!building) {
            return [];
        }
        return building.areas.map((area) =>
            convertToGraphQlAreaWithFloorTitle(area)
        );
    }

    @FieldResolver((type) => BuildingGroup, { nullable: true })
    async buildingGroup(
        @Root() building: Building,
        @Ctx() ctx: Context
    ): Promise<BuildingGroup | null> {
        //TODO: investigate why using findUnique throws a error
        const buildingWithGroup = await ctx.prisma.building.findFirst({
            where: {
                id: building.databaseId,
            },
            select: {
                buildingGroup: {
                    include: {
                        buildings: true,
                    },
                },
            },
        });
        const buildingGroup = buildingWithGroup?.buildingGroup;
        if (!buildingGroup) {
            return null;
        }
        return convertToGraphQLBuildingGroup(buildingGroup);
    }

    @Mutation((returns) => BuildingGroup)
    async createBuildingGroup(
        @Arg("data") data: CreateBuildingGroup,
        @Ctx() ctx: Context
    ): Promise<BuildingGroup> {
        const user = await getUserOrThrowError(ctx.cookies);
        const buildingGroup = await ctx.prisma.buildingGroup.create({
            data: {
                name: data.name,
                creator: {
                    connect: {
                        id: user.databaseId,
                    },
                },
            },
            include: {
                buildings: true,
            },
        });
        return convertToGraphQLBuildingGroup(buildingGroup);
    }

    @Mutation((returns) => Building, { nullable: true })
    async addBuildingToBuildingGroup(
        @Arg("data") data: ConnectBuildingToBuildingGroup,
        @Ctx() ctx: Context
    ): Promise<Building | null> {
        const authError = await checkAuthrizedBuildingEditor(data.id, ctx);
        if (authError) {
            throw authError;
        }
        if (data.buildingGroupDatabaseId === null) {
            await ctx.prisma.building.update({
                where: {
                    id: data.id,
                },
                data: {
                    buildingGroup: {
                        disconnect: true,
                    },
                },
            });
            return null;
        }
        const building = await ctx.prisma.building.update({
            where: {
                id: data.id,
            },
            data: {
                buildingGroup: {
                    connect: {
                        id: data.buildingGroupDatabaseId,
                    },
                },
            },
        });
        return convertToGraphQLBuilding(building);
    }
}

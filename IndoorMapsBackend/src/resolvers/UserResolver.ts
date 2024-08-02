import 'reflect-metadata'
import { Resolver, Query, Mutation, Arg, Ctx, InputType, Field, FieldResolver, Root, } from 'type-graphql'
import { Context } from '../utils/context.js'
import { BuildingWithPerms, LogedInUser, SignedOutSuccess, User } from '../graphqlSchemaTypes/User.js'
import auth from '../auth/auth.js'
import { validateUser } from '../auth/validateUser.js';
import { convertToGraphQLBuilding, convertToGraphQLBuildingGroup, convertToGraphQLUser } from '../utils/typeConversions.js'
import { deleteAccessToken } from '../auth/jwt.js'
import { throwGraphQLBadInput } from '../utils/generic.js'
import { Building, BuildingGroup } from '../graphqlSchemaTypes/Building.js'
import { sendVerificationEmail } from '../email/setup.js'

const oneMonthInMilliseconds = 43800 * 60 * 1000;

@InputType()
class UserCreateInput {
    @Field()
    email: string

    @Field()
    name: string

    @Field()
    password: string
}

@InputType()
class UserLoginInput {
    @Field()
    email: string

    @Field()
    password: string
}

@InputType()
class verifyEmailWithTokenInput {
    @Field()
    token: string
}

@Resolver(User)
export class UserResolver {
    @FieldResolver((type) => [BuildingWithPerms]!)
    async BuildingWithPerms(
        @Root() user: User,
        @Ctx() ctx: Context,
    ) {
        //TODO: investigate why using findUnique throws a error
        const userWithBuildings = await ctx.prisma.user.findFirst({
            where: {
                id: user.databaseId
            },
            include: {
                buildings: {
                    select: {
                        id: true,
                        editorLevel: true,
                        building: {
                            include: {
                                floors: true
                            }
                        },
                    },
                },
            },
        });
        if (!userWithBuildings) {
            throw throwGraphQLBadInput('User not found');
        }
        const buildingEditorJoinRows = userWithBuildings.buildings;
        return buildingEditorJoinRows.map((buildingEditorJoinRow) => {
            return {
                id: "buildingEditor" + buildingEditorJoinRow.id,
                editorLevel: buildingEditorJoinRow.editorLevel,
                building: convertToGraphQLBuilding(buildingEditorJoinRow.building)
            }
        })
    }

    @Mutation((returns) => User)
    async signupUser(
        @Arg('data') data: UserCreateInput,
        @Ctx() ctx: Context,
    ): Promise<User> {
        const { userFromDB, accessToken } = await auth.register({ name: data.name, email: data.email, password: data.password, isEmailVerified: false });
        ctx.res.cookie("jwt", accessToken, { maxAge: oneMonthInMilliseconds, httpOnly: true, sameSite: "none", secure: true });
        const verifyEmailToken = await auth.getVerifyEmailToken(userFromDB.id);
        sendVerificationEmail(userFromDB.email, verifyEmailToken, userFromDB.name)
        return convertToGraphQLUser(userFromDB);
    }
    @Mutation((returns) => User)
    async signinUser(
        @Arg('data') data: UserLoginInput,
        @Ctx() ctx: Context,
    ): Promise<User> {
        const { userFromDB, accessToken } = await auth.login({ email: data.email, password: data.password });
        ctx.res.cookie("jwt", accessToken, { maxAge: oneMonthInMilliseconds, httpOnly: true, sameSite: "none", secure: true });
        return convertToGraphQLUser(userFromDB);
    }

    @Mutation((returns) => SignedOutSuccess)
    async signOut(
        @Ctx() ctx: Context,
    ): Promise<SignedOutSuccess> {
        if (!ctx.cookies || !ctx.cookies.jwt) {
            throw throwGraphQLBadInput('No user signed in');
        }
        await deleteAccessToken(ctx.cookies.jwt);
        ctx.res.clearCookie("jwt")
        return {
            success: true
        };
    }

    @Mutation((returns) => LogedInUser)
    async verifyUser(
        @Arg('data') data: verifyEmailWithTokenInput,
        @Ctx() ctx: Context,
    ): Promise<LogedInUser> {
        const { userFromDB, accessToken } = await auth.convertVerifyEmailTokenToFullToken(data.token);
        ctx.res.cookie("jwt", accessToken, { maxAge: oneMonthInMilliseconds, httpOnly: true, sameSite: "none", secure: true });
        return {
            id: "LogedInUser",
            isLogedIn: true,
            user: convertToGraphQLUser(userFromDB),
        }
    }

    @Query(() => [User])
    async allUsers(@Ctx() ctx: Context) {
        return (await ctx.prisma.user.findMany()).map((dbUser) => convertToGraphQLUser(dbUser));
    }

    @Query(() => LogedInUser)
    async getUserFromCookie(@Ctx() ctx: Context) {
        const user = await validateUser(ctx.cookies);
        if (!user) {
            return {
                id: "LogedInUser",
                isLogedIn: false
            }
        }
        return {
            id: "LogedInUser",
            isLogedIn: true,
            user: user,
        }
    }

    @FieldResolver((type) => [BuildingGroup]!)
    async buildingGroups(
        @Root() user: User,
        @Ctx() ctx: Context,
    ): Promise<BuildingGroup[]> {
        const buildingGroups = await ctx.prisma.buildingGroup.findMany({
            where: {
                creator: {
                    is: {
                        id: user.databaseId
                    }
                }
            },
            include: {
                buildings: true
            }
        });
        if (!buildingGroups) {
            return [];
        }
        return buildingGroups.map((buildingGroup) => convertToGraphQLBuildingGroup(buildingGroup));
    }
}

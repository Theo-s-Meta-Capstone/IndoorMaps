import 'reflect-metadata'
import {
    Resolver,
    Query,
    Mutation,
    Arg,
    Ctx,
    InputType,
    Field,
    FieldResolver,
    Root,
} from 'type-graphql'
import { Context } from './context.js'
import { BuildingWithPerms, LogedInUser, SignedOutSuccess, User } from './User.js'
import auth from './auth/auth.js'
import { validateUser } from './auth/validateUser.js';
import { convertToGraphQLBuilding, convertToGraphQLUser } from './utils/typeConversions.js'
import { GraphQLError } from 'graphql'
import { deleteAccessToken } from './auth/jwt.js'

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
            throw new GraphQLError('User not found', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
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
        ctx.res.cookie("jwt", accessToken, { maxAge: oneMonthInMilliseconds, httpOnly: true, sameSite: "none" });
        return convertToGraphQLUser(userFromDB);
    }
    @Mutation((returns) => User)
    async signinUser(
        @Arg('data') data: UserLoginInput,
        @Ctx() ctx: Context,
    ): Promise<User> {
        const { userFromDB, accessToken } = await auth.login({ email: data.email, password: data.password });
        ctx.res.cookie("jwt", accessToken, { maxAge: oneMonthInMilliseconds, httpOnly: true, sameSite: "none" });
        return convertToGraphQLUser(userFromDB);
    }

    @Mutation((returns) => SignedOutSuccess)
    async signOut(
        @Ctx() ctx: Context,
    ): Promise<SignedOutSuccess> {
        if (!ctx.cookies || !ctx.cookies.jwt) {
            throw new GraphQLError('No user signed in', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        await deleteAccessToken(ctx.cookies.jwt);
        ctx.res.clearCookie("jwt")
        return {
            success: true
        };
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
}

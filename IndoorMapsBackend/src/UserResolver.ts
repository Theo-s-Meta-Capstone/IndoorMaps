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
import { LogedInUser, SignedOutSuccess, User } from './User.js'
import auth from './auth/auth.js'
import { validateUser } from './auth/validateUser.js';
import { convertToGraphQLUser } from './utils/typeConversions.js'
import { GraphQLError } from 'graphql'
import jwt from './auth/jwt.js'

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
    @Mutation((returns) => User)
    async signupUser(
        @Arg('data') data: UserCreateInput,
        @Ctx() ctx: Context,
    ): Promise<User> {
        const { userFromDB, accessToken } = await auth.register({ name: data.name, email: data.email, password: data.password, isEmailVerified: false });
        ctx.res.cookie("jwt", accessToken)
        return convertToGraphQLUser(userFromDB);
    }

    @Mutation((returns) => User)
    async signinUser(
        @Arg('data') data: UserLoginInput,
        @Ctx() ctx: Context,
    ): Promise<User> {
        const { userFromDB, accessToken } = await auth.login({ email: data.email, password: data.password });
        ctx.res.cookie("jwt", accessToken)
        return convertToGraphQLUser(userFromDB);
    }

    @Mutation((returns) => SignedOutSuccess)
    async signOut(
        @Ctx() ctx: Context,
    ): Promise<SignedOutSuccess> {
        if(!ctx.cookies || !ctx.cookies.jwt){
            throw new GraphQLError('No user signed in', {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }
        await jwt.deleteAccessToken(ctx.cookies.jwt);
        ctx.res.clearCookie("jwt")
        return {
            success: true
        };
    }

    @Query(() => [User])
    async allUsers(@Ctx() ctx: Context) {
        return ctx.prisma.user.findMany()
    }

    @Query(() => LogedInUser)
    async getUserFromCookie(@Ctx() ctx: Context) {
        const user = await validateUser(ctx.cookies);
        if (!user) {
            return {
                id:"LogedInUser",
                isLogedIn: false
            }
        }
        return {
            id:"LogedInUser",
            isLogedIn: true,
            user: user,
        }
    }
}

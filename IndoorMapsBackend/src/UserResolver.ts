import 'reflect-metadata'
import {
    Resolver,
    Query,
    Mutation,
    Arg,
    Ctx,
    InputType,
    Field,
    ObjectType,
} from 'type-graphql'
import { Context } from './context.js'
import { User } from './User.js'
import { User as DbUser} from '@prisma/client';
import auth from './auth/auth.js'
import { validateUser } from './auth/validateUser.js';

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

@ObjectType()
class LogedInUser {
    @Field()
    isLogedIn: boolean

    @Field((type) => User, {nullable: true})
    user: User
}

const convertToGraphQLUser = (userFromDB: DbUser, accessToken: string): User => {
    const user: User = {
        id: userFromDB.id,
        name: userFromDB.name,
        email: userFromDB.email,
        token: accessToken,
        isEmailVerified: userFromDB.isEmailVerified
    }
    return user;
}

@Resolver(User)
export class UserResolver {
    @Mutation((returns) => User)
    async signupUser(
        @Arg('data') data: UserCreateInput,
        @Ctx() ctx: Context,
    ): Promise<User> {
        const { userFromDB, accessToken } = await auth.register({ name: data.name, email: data.email, password: data.password, isEmailVerified: false });
        return convertToGraphQLUser(userFromDB, accessToken);
    }

    @Mutation((returns) => User)
    async signinUser(
        @Arg('data') data: UserLoginInput,
        @Ctx() ctx: Context,
    ): Promise<User> {
        const { userFromDB, accessToken } = await auth.login({ email: data.email, password: data.password });
        return convertToGraphQLUser(userFromDB, accessToken);
    }

    @Query(() => [User])
    async allUsers(@Ctx() ctx: Context) {
        return ctx.prisma.user.findMany()
    }

    @Query(() => LogedInUser)
    async getUserFromCookie(@Ctx() ctx: Context) {
        const user = await validateUser(ctx.cookies);
        if(!user) {
            return {
                isLogedIn: false,
            }
        }
        return {
            isLogedIn: true,
            user: user,
        }
    }
}

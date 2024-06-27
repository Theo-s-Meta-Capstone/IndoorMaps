import 'reflect-metadata'
import {
    Resolver,
    Query,
    Mutation,
    Arg,
    Ctx,
    FieldResolver,
    Root,
    Int,
    InputType,
    Field,
} from 'type-graphql'
import { Context } from './context.js'
import { User } from './User.js'
import auth from '../auth/auth.js'
@InputType()
class UserUniqueInput {
    @Field({ nullable: true })
    id: number

    @Field({ nullable: true })
    email: string
}

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

        const user: User = {
            id: userFromDB.id,
            name: userFromDB.name,
            email: userFromDB.email,
            token: accessToken,
            isEmailVerified: userFromDB.isEmailVerified
        }
        return user;
    }

    @Query((returns) => User)
    async signinUser(
        @Arg('data') data: UserLoginInput,
        @Ctx() ctx: Context,
    ): Promise<User> {

        const { userFromDB, accessToken } = await auth.login({ email: data.email, password: data.password });

        const user: User = {
            id: userFromDB.id,
            name: userFromDB.name,
            email: userFromDB.email,
            token: accessToken,
            isEmailVerified: userFromDB.isEmailVerified
        }
        return user;
    }

    @Query(() => [User])
    async allUsers(@Ctx() ctx: Context) {
        return ctx.prisma.user.findMany()
    }

}

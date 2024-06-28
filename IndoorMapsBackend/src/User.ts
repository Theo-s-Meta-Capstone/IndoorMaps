import 'reflect-metadata'
import { ObjectType, Field, ID } from 'type-graphql'
import { IsEmail } from 'class-validator'

@ObjectType()
export class User {
  @Field((type) => ID)
  id: string

  @Field()
  @IsEmail()
  email: string

  @Field()
  name: string

  @Field({ defaultValue: false })
  isEmailVerified: boolean
}

@ObjectType()
export class LogedInUser {
  @Field((type) => ID)
  id: string;

  @Field()
  isLogedIn: boolean

  @Field((type) => User, { nullable: true })
  user: User
}

@ObjectType()
export class SignedOutSuccess {
  @Field()
  success: boolean
}

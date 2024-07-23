import 'reflect-metadata'
import { ObjectType, Field, ID, registerEnumType } from 'type-graphql'
import { IsEmail } from 'class-validator'
import { Building } from './Building.js';
import { MutationResult } from '../utils/generic.js';

@ObjectType()
export class User {
  @Field((type) => ID)
  id: string

  @Field()
  databaseId: number

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
  @Field(type => ID)
  id: string;

  @Field()
  isLogedIn: boolean

  @Field((type) => User, { nullable: true })
  user: User
}

@ObjectType()
export class SignedOutSuccess extends MutationResult {
}

enum EditorLevel {
  viewer = "viewer",
  editor = "editor",
  owner = "owner"
}

registerEnumType(EditorLevel, {
  name: "EditorLevel",
});

@ObjectType()
export class BuildingWithPerms {
  @Field(type => ID)
  id: string;

  @Field(type => EditorLevel)
  editorLevel: EditorLevel

  @Field(type => Building)
  building: Building
}

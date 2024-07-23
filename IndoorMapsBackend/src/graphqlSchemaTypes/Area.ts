import 'reflect-metadata'
import { ObjectType, Field, ID, Int } from 'type-graphql'
import { MutationResult } from '../utils/generic.js'

@ObjectType()
export class NewAreaResult extends MutationResult {
  @Field(type => Int)
  databaseId: number

  @Field(type => Int)
  floorDatabaseId: number
}

@ObjectType()
export class Area {
  @Field((type) => ID)
  id: string

  @Field(type => Int)
  databaseId: number

  @Field()
  title: string

  @Field()
  description: string

  @Field()
  shape: string

  @Field()
  traversable: boolean

  @Field()
  category: string

  @Field({nullable: true})
  entrances?: string

  @Field(type => Int)
  floorDatabaseId: number
}

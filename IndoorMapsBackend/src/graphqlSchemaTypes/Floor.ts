import { Field, ID, Int, ObjectType } from "type-graphql"

import { MutationResult } from '../utils/generic.js'


@ObjectType()
export class NewFloorResult extends MutationResult {
  @Field(type => Int)
  databaseId: number

  @Field(type => Int)
  buildingDatabaseId: number
}

@ObjectType()
export class Floor {
  @Field((type) => ID)
  id: string

  @Field(type => Int)
  databaseId: number

  @Field()
  title: string

  @Field()
  description: string

  @Field({ nullable: true })
  shape?: string
}

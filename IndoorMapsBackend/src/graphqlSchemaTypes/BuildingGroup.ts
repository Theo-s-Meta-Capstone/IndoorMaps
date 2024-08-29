import { Field, ID, Int, ObjectType } from "type-graphql"
import { Building } from "./Building"

@ObjectType()
export class BuildingGroup {
  @Field((type) => ID)
  id: string

  @Field(type => Int)
  databaseId: number

  @Field()
  name: string

  @Field(type => [Building])
  buildings: Building[]
}
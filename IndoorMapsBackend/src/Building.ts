import 'reflect-metadata'
import { ObjectType, Field, ID } from 'type-graphql'

@ObjectType()
export class Floor {
  @Field((type) => ID)
  id: string

  @Field()
  title: string

  @Field()
  description: string

  // TODO: Add Area
}

@ObjectType()
export class Building {
  @Field((type) => ID)
  id: string

  @Field()
  databaseId: number

  @Field()
  title: string

  @Field()
  description: string
}

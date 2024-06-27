import 'reflect-metadata'
import { ObjectType, Field, ID } from 'type-graphql'

@ObjectType()
class Floor {
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
  title: string

  @Field()
  description: string

  @Field((type) => [Floor])
  floors: Floor[]
}

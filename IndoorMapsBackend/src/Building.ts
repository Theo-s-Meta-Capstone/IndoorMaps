import 'reflect-metadata'
import { ObjectType, Field, ID, Float, Int } from 'type-graphql'

import { MutationResult } from './utils/generic.js'

@ObjectType()
export class NewFloorResult extends MutationResult {
  @Field(type => Int)
  databaseId: number

  @Field(type => Int)
  buildingDatabaseId: number
}

@ObjectType()
export class NewAreaResult extends MutationResult {
  @Field(type => Int)
  databaseId: number

  @Field(type => Int)
  floorDatabaseId: number
}

@ObjectType()
export class LatLng {
  constructor(lat: number, lon: number) {
    this.lat = lat;
    this.lon = lon
  }
  @Field(type => Float)
  lat: number

  @Field(type => Float)
  lon: number
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

@ObjectType()
export class Building {
  @Field((type) => ID)
  id: string

  @Field(type => Int)
  databaseId: number

  @Field()
  title: string

  @Field(type => LatLng)
  startPos: LatLng

  @Field()
  address: string
}

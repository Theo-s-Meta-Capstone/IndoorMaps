import 'reflect-metadata'
import { ObjectType, Field, ID, Float, Int } from 'type-graphql'

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
export class Floor {
  @Field((type) => ID)
  id: string

  @Field()
  title: string

  @Field()
  address: string
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

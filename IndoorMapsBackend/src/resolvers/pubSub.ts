import { createPubSub } from "graphql-yoga";
import { ObjectType, Field, ID, Float } from 'type-graphql'

@ObjectType()
export class LiveLocation {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  latitude: number;

  @Field(() => Float)
  longitude: number;

  @Field()
  name: string;

  @Field()
  message: string;
}

export const pubSub = createPubSub<{
  LIVELOCATIONS: [LiveLocation];
  DYNAMIC_ID_TOPIC: [number, LiveLocation];
}>();

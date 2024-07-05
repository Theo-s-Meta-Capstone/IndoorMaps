import { Field, ID, InterfaceType, ObjectType } from "type-graphql";

@InterfaceType()
export abstract class Node {
  @Field(type => ID)
  id: string;
}

@ObjectType()
export class MutationResult {
  @Field()
  success: boolean
}

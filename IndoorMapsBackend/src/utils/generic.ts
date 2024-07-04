import { Field, ID, InterfaceType, ObjectType } from "type-graphql";

@InterfaceType()
abstract class Node {
  @Field(type => ID)
  id: string;
}

@ObjectType()
export class MutationResult {
  @Field()
  success: boolean
}

import { GraphQLError } from "graphql";
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

export const throwGraphQLBadInput = (meassage: string) => {
  return new GraphQLError(meassage, {
    extensions: {
        code: 'BAD_USER_INPUT',
    },
  });
}

export function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

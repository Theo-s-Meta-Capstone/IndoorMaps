// // modified from https://www.albertgao.xyz/2020/08/30/how-to-use-relay-style-pagination-in-typegraphql/


// import * as Relay from "graphql-relay";
// import { ObjectType, Field, ArgsType, ClassType } from "type-graphql";

// @ArgsType()
// export class ConnectionArgs implements Relay.ConnectionArguments {
//     @Field((type) => String, {
//         nullable: true,
//         description: "Paginate before opaque cursor",
//     })
//     before?: Relay.ConnectionCursor;

//     @Field((type) => String, {
//         nullable: true,
//         description: "Paginate after opaque cursor",
//     })
//     after?: Relay.ConnectionCursor;

//     @Field((type) => Number, { nullable: true, description: "Paginate first" })
//     first?: number;

//     @Field((type) => Number, { nullable: true, description: "Paginate last" })
//     last?: number;
// }

// @ObjectType()
// class PageInfo implements Relay.PageInfo {
//     @Field((type) => Boolean)
//     hasNextPage: boolean;

//     @Field((type) => Boolean)
//     hasPreviousPage: boolean;

//     @Field((type) => String, { nullable: true })
//     startCursor: Relay.ConnectionCursor;

//     @Field((type) => String, { nullable: true })
//     endCursor: Relay.ConnectionCursor;
// }

// export function EdgeType<NodeType>(
//     nodeName: string,
//     nodeType: ClassType<NodeType>
// ) {
//     @ObjectType(`${nodeName}Edge`, { isAbstract: true })
//     abstract class Edge implements Relay.Edge<NodeType> {
//         @Field((type) => nodeType)
//         node: NodeType;

//         @Field((type) => String, {
//             description: "Used in `before` and `after` args",
//         })
//         cursor: Relay.ConnectionCursor;
//     }

//     return Edge;
// }

// type ExtractNodeType<EdgeType> = EdgeType extends Relay.Edge<infer NodeType>
//     ? NodeType
//     : never;

// export function ConnectionType<
//     EdgeType extends Relay.Edge<NodeType>,
//     NodeType = ExtractNodeType<EdgeType>
// >(nodeName: string, edgeClass: ClassType<EdgeType>) {
//     @ObjectType(`${nodeName}Connection`, { isAbstract: true })
//     abstract class Connection implements Relay.Connection<NodeType> {
//         @Field((type) => PageInfo)
//         pageInfo: PageInfo;

//         @Field((type) => [edgeClass])
//         edges: EdgeType[];
//     }

//     return Connection;
// }

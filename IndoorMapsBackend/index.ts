import "reflect-metadata";
import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as tq from 'type-graphql'
import { Context, context } from "./src/context.js";
import { UserResolver } from "./src/UserResolver.js";

// only required due to Prisma no longer automaticly load .env files in v16
import 'dotenv/config'

const schema = await tq.buildSchema({
    resolvers: [UserResolver],
    // scalarsMap: [{ type: GraphQLScalarType, scalar: DateTimeResolver }],
    validate: { forbidUnknownValues: false }
})

const server = new ApolloServer<Context>({ schema })

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, { context: async () => context })

console.log(`
🚀 Server ready at: ${url}
⭐️  See sample queries: http://pris.ly/e/ts/graphql-typegraphql#using-the-graphql-api`
)

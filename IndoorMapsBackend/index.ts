import "reflect-metadata";
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from "cookie-parser"
import { startStandaloneServer } from '@apollo/server/standalone';
import * as tq from 'type-graphql'
import { prisma, Context } from "./src/context.js";
import { UserResolver } from "./src/UserResolver.js";
import { BuildingResolver } from "./src/BuildingResolver.js";

// only required due to Prisma no longer automaticly load .env files in v16
import 'dotenv/config'

const schema = await tq.buildSchema({
    resolvers: [UserResolver, BuildingResolver],
    // scalarsMap: [{ type: GraphQLScalarType, scalar: DateTimeResolver }],
    validate: { forbidUnknownValues: false },
    emitSchemaFile: "../IndoorMapsFrontend/src/schema.graphql",
})

const app = express();
const httpServer = http.createServer(app);
const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],


});

await server.start();

if (!process.env.FRONTEND_URL) {
    throw new Error("no frontend url provided")
}

app.use(
    '/graphql',
    cors<cors.CorsRequest>({ origin: [process.env.FRONTEND_URL], credentials: true }),
    cookieParser(),
    express.json(),
    expressMiddleware(server, {
        context: async ({ req }):Promise<Context> => ({ prisma: prisma, cookies: req.cookies.jwt }),
    }),
);

await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/graphql`);

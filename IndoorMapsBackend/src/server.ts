import "reflect-metadata";
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from "cookie-parser"
import * as tq from 'type-graphql'
import { prisma, Context } from "./context.js";
import { UserResolver } from "./UserResolver.js";
import { BuildingResolver } from "./BuildingResolver.js";

// only required due to Prisma no longer automaticly load .env files in v16
import 'dotenv/config'

const app = express();
export const httpServer = http.createServer(app);

/**
 * the main function is to avoid running awaits at the top level of the file (but this is not necesary in the more recent versions of JavaScript)
 */
async function main() {
    const schema = await tq.buildSchema({
        resolvers: [UserResolver, BuildingResolver],
        validate: { forbidUnknownValues: false },
        emitSchemaFile: "../IndoorMapsFrontend/src/schema.graphql",
    })
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
            context: async ({ req, res }): Promise<Context> => ({ prisma: prisma, cookies: req.cookies, res: res }),
        }),
    );
}

main();

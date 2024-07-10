import "reflect-metadata";
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from "cookie-parser"
import * as tq from 'type-graphql'
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
// only required due to Prisma no longer automaticly load .env files in v16
import 'dotenv/config'

import { pubSub } from "./resolvers/pubSub.js";
import { prisma, Context } from "./utils/context.js";
import { UserResolver } from "./resolvers/UserResolver.js";
import { BuildingResolver } from "./resolvers/BuildingResolver.js";
import { FloorResolver } from "./resolvers/FloorResolver.js";
import { AreaResolver } from "./resolvers/AreaResolver.js";
import { GeododerResolver } from "./resolvers/AutocompleteResolver.js";

const app = express();
export const httpServer = http.createServer(app);
const BUILD_PREVIEW_URL = "http://localhost:4173";

/**
 * the main function is to avoid running awaits at the top level of the file (but this is not necesary in the more recent versions of JavaScript)
 */
async function main() {
    const schema = await tq.buildSchema({
        resolvers: [GeododerResolver, UserResolver, AreaResolver, FloorResolver, BuildingResolver],
        validate: { forbidUnknownValues: false },
        emitSchemaFile: "../IndoorMapsFrontend/src/schema.graphql",
        pubSub,
    })

    // Creating the WebSocket server
    const wsServer = new WebSocketServer({
        // This is the `httpServer` we created in a previous step.
        server: httpServer,
    });

    // Hand in the schema we just created and have the
    // WebSocketServer start listening.
    const serverCleanup = useServer({ schema }, wsServer);

    const server = new ApolloServer({
        schema,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
        // Proper shutdown for the WebSocket server.
        {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await serverCleanup.dispose();
                    },
                };
            },
        },
        ],
    });

    await server.start();

    if (!process.env.FRONTEND_URL) {
        throw new Error("no frontend url provided")
    }

    app.use(
        '/graphql',
        cors<cors.CorsRequest>({ origin: [process.env.FRONTEND_URL, BUILD_PREVIEW_URL], credentials: true }),
        cookieParser(),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req, res }): Promise<Context> => ({ prisma: prisma, cookies: req.cookies, res: res }),
        }),
    );
}

main();

import { httpServer } from "./server.js";
import { server } from "./utils/websocketServer.js";

// Here both the websocket server and the Graphql Server are started on different ports
const EXPRESS_PORT = 4500
const WEBSOCKET_PORT = 9000

await new Promise<void>((resolve) => httpServer.listen({ port:EXPRESS_PORT }, resolve));
console.log(`🚀 Server ready at http://localhost:${ EXPRESS_PORT }/graphql`);
await new Promise<void>((resolve) => server.listen({ port: WEBSOCKET_PORT }, resolve));
console.log(`🚀 Websocket ready at http://localhost:${ WEBSOCKET_PORT }/ws`);

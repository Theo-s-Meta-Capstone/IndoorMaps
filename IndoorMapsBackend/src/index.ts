import { httpServer } from "./server.js";

const port = process.env.PORT || 4000;

await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
console.log(`🚀 Server ready at http://localhost:${ port }/graphql`);

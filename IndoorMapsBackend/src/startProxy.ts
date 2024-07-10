import http from "http"
import url from "url"
import httpProxy from "http-proxy"
const EXPRESS_PORT = 4500
const WEBSOCKET_PORT = 9000

// Here both the websocket server and the Graphql Server are started on different ports
const EXPRESS_URL = process.env.EXPRESS_URL || `http://localhost:${EXPRESS_PORT}`;
const WEBSOCKET_URL = process.env.WEBSOCKET_URL || `http://localhost:${WEBSOCKET_PORT}`;

const proxy = httpProxy.createProxy();
// When a url is send it is proxied to the correct port based on the base url path
const options = {
    '/graphql': EXPRESS_URL,
    '/ws': WEBSOCKET_URL,
    '/': EXPRESS_URL
}

const port = process.env.PORT || 4000;

// This code takes a request on the main port and decides if it should be proxied to the graphql server or to the websocket server.
var proxyServer = http.createServer((req, res) => {
    if(!req.url) return;

    const pathname = url.parse(req.url).pathname;
    if(!pathname) return;

    for (const [pattern, target] of Object.entries(options)) {
        if (pathname === pattern ||
            pathname.startsWith(pattern + '/')
        ) {
            proxy.web(req, res, {target});
        }
    }
}).listen(port);


// Websockets use a different protocal (ws://) so http.createServer doesn't listen to them by default
proxyServer.on('upgrade', function (req, socket, head) {
    if(!req.url) return;

    const pathname = url.parse(req.url).pathname;
    if(!pathname) return;

    for (const [pattern, target] of Object.entries(options)) {
        if (pathname === pattern ||
            pathname.startsWith(pattern + '/')
        ) {
            proxy.ws(req, socket, head, {target});
        }
    }
});

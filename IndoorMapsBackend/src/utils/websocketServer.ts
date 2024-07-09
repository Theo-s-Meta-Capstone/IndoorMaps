import net from 'net';
import crypto from 'crypto';

// implementation based on https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
export const server = net.createServer(sock => {
    let client = sock.remoteAddress;
    console.log('serving stream to ' + client);

    sock.on('data', data => {
        const dataString = data.toString();
        const dataLines = dataString.split("\r\n");
        console.log(dataLines);
        let userWebsocketKey: string = "";
        dataLines.forEach(line => {
            if (line.startsWith("sec-websocket-key: ")) {
                userWebsocketKey = line.split(" ")[1];
            }
        }
        )

        console.log("sec-websocket-key request = " + userWebsocketKey)
        let magicString = userWebsocketKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        magicString = crypto.createHash('sha1').update(magicString).digest('base64');

        console.log("Sec-WebSocket-Accept computed response = " + magicString)
        sock.write(
            `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${magicString}\r\n\r\n`
        )
    });

    // // Headers:
    // sock.write(
    //     'HTTP/1.0 200 OK\r\n' +
    //     '\r\n'
    // );

    // sock.write('Hello world');
    // sock.end(); // HTTP 1.0 signals end of packet by closing the socket
});

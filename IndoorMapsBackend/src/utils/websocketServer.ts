import net from 'net';
import crypto from 'crypto';
import { WebsocketUserTracker } from '../types';
import { getUserOrThrowError } from '../auth/validateUser.js';
import { pubSub } from '../resolvers/pubSub.js';

const verbose = 0;

function dec2bin(dec: number) {
    return (dec >>> 0).toString(2);
}

const utf8decoder = new TextDecoder(); // default 'utf-8' or 'utf8'

`
The WebSocket Frame (Quote from MDM "Either the client or the server can choose to send a message at any time — that's the magic of WebSockets. However, extracting information from these so-called "frames" of data is a not-so-magical experience.")
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-------+-+-------------+-------------------------------+
|F|R|R|R| opcode|M| Payload len |    Extended payload length    |
|I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
|N|V|V|V|       |S|             |   (if payload len==126/127)   |
| |1|2|3|       |K|             |                               |
+-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
|     Extended payload length continued, if payload len == 127  |
+ - - - - - - - - - - - - - - - +-------------------------------+
|                               |Masking-key, if MASK set to 1  |
+-------------------------------+-------------------------------+
| Masking-key (continued)       |          Payload Data         |
+-------------------------------- - - - - - - - - - - - - - - - +
:                     Payload Data continued ...                :
+ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
|                     Payload Data continued ...                |
+---------------------------------------------------------------+
`

// based on https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#decoding_payload_length
const getPayloadHeader = (data: Buffer) => {
    const FIN = data.readUInt8() & 255;
    //OPCODE = 0x0 for continuation, 0x1 for text (which is always encoded in UTF-8), 0x2 for binary
    const OPCODE = (data.readUInt8() & 15);
    const MASK = (data.readUInt8(1) >>> 7);
    // converting from 8 bit number to 7 bit number by anding with 0111 1111 to get rid of the first bit
    let dataLength = data.readUInt8(1) & 127
    let MASKcode = [0, 0, 0, 0];

    if (verbose) {
        console.log(dec2bin(data.readUInt32BE()).padStart(32, "0") + dec2bin(data.readUInt32BE(4)).padStart(32, "0"));
        console.log("0         1         2         3         4         5         6         7         8         9        0")
        console.log("0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789")
        console.log(dec2bin(FIN) + " FIN bit ");
        console.log("    " + dec2bin(OPCODE).padStart(4, '0') + " OPCODE ");
        console.log("        " + dec2bin(MASK) + " MASK bit ");
        console.log("         " + dec2bin(dataLength).padStart(7, '0') + " data length = " + dataLength);
    }
    // The MASK bit tells whether the message is encoded. Messages from the client must be masked, so your server must expect this to be 1. (In fact, section 5.1 of the spec says that your server must disconnect from a client if that client sends an unmasked message.)
    if (MASK != 1 && OPCODE != 0xA) {
        throw new Error("masking not implemented");
    }

    let dataStart = 6;

    // Read the next 16 bits and interpret those as an unsigned integer.
    if (dataLength == 126) {
        dataLength = data.readUInt16BE(2);
        // 2 more bytes are used up by the longer length so the new mask code is based on bytes 5 and 6
        MASKcode[0] = data.readUInt8(4)
        MASKcode[1] = data.readUInt8(5)
        MASKcode[2] = data.readUInt8(6)
        MASKcode[3] = data.readUInt8(7)
        dataStart = 8;
        if (verbose) {
            console.log("                " + dec2bin(dataLength).padStart(16, '0') + " data length = " + dataLength);
            console.log("Masks                           " + dec2bin(MASKcode[0]).padStart(8, '0') + "        " + dec2bin(MASKcode[2]).padStart(8, '0'));
            console.log("                                        " + dec2bin(MASKcode[1]).padStart(8, '0') + "        " + dec2bin(MASKcode[3]).padStart(8, '0'));
        }
    }
    // Read the next 64 bits and interpret those as an unsigned integer. (The most significant bit must be 0.) You're done.
    // Not tested
    else if (dataLength == 127) {
        // This covers the case where the size is too big for 16 bits, but not larger then a int
        dataLength = Number(data.readBigUInt64BE(2))
        MASKcode[0] = data.readUInt8(10)
        MASKcode[1] = data.readUInt8(11)
        MASKcode[2] = data.readUInt8(12)
        MASKcode[3] = data.readUInt8(13)
        if (verbose) {
            console.log("                " + dec2bin(dataLength).padStart(64, '0') + " data length = " + dataLength);
            console.log("Masks           " + " ".repeat(64) + dec2bin(MASKcode[0]).padStart(8, '0') + "        " + dec2bin(MASKcode[2]).padStart(8, '0'));
            console.log("                " + " ".repeat(72) + dec2bin(MASKcode[1]).padStart(8, '0') + "        " + dec2bin(MASKcode[3]).padStart(8, '0'));
        }
    } else {
        // Runs if the length was below 126
        MASKcode[0] = data.readUInt8(2)
        MASKcode[1] = data.readUInt8(3)
        MASKcode[2] = data.readUInt8(4)
        MASKcode[3] = data.readUInt8(5)
        if (verbose) {
            console.log("Masks           " + dec2bin(MASKcode[0]).padStart(8, '0') + "        " + dec2bin(MASKcode[2]).padStart(8, '0'));
            console.log("                        " + dec2bin(MASKcode[1]).padStart(8, '0') + "        " + dec2bin(MASKcode[3]).padStart(8, '0'));
        }
    }

    return { dataLength, MASKcode, dataStart };
}

const openSockets: WebsocketUserTracker = {};

// implementation based on https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
export const server = net.createServer(sock => {
    let client = sock.remoteAddress;
    if (verbose) console.log('serving stream to ' + client);

    const estiblishWsConnection = (dataLines: string[]) => {
        let userWebsocketKey: string = "";
        let cookiesHeader: string = "";
        dataLines.forEach(line => {
            if (line.startsWith("sec-websocket-key: ")) {
                userWebsocketKey = line.split(" ")[1];
            }
            else if (line.startsWith("cookie: ")) {
                cookiesHeader = line.split(" ")[1];
            }
        })

        if (verbose) console.log("sec-websocket-key request = " + userWebsocketKey)
        let magicString = userWebsocketKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        magicString = crypto.createHash('sha1').update(magicString).digest('base64');

        const uniqueKey = crypto.randomUUID()
        const jwtCookie = cookiesHeader.split(";").find(cookie => cookie.startsWith("jwt="));
        if (!jwtCookie) {
            console.log("no jwt cookie found")
            return;
        }

        openSockets[uniqueKey] = {
            jwt: jwtCookie.trim().slice("jwt=".length),
            timeCreated: Date.now(),
        }

        if (verbose) console.log("Sec-WebSocket-Accept computed response = " + magicString)
        sock.write(
            `HTTP/1.1 101 Switching Protocols\r\nSet-Cookie: wsKey=${uniqueKey};\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${magicString}\r\n\r\n`
        )
    }

    const receiveLocationSocket = async (data: Buffer) => {
        try {
            const { dataLength, MASKcode, dataStart } = getPayloadHeader(data);
            if (dataLength + dataStart > data.length) {
                console.log("data length is too big to be handled by this buffer");
            }
            const dataBody = data.subarray(dataStart, dataStart + dataLength);
            const DECODED = Uint8Array.from(dataBody, (elt, i) => elt ^ MASKcode[i % 4]); // Perform an XOR on the mask)
            const decodedText = utf8decoder.decode(DECODED);
            const decodedJson = JSON.parse(decodedText);
            if (!openSockets[decodedJson.wsKey]) {
                console.error("invalid wsKey")
                return;
            }
            if (verbose) console.log(decodedJson);
            const user = await getUserOrThrowError(openSockets[decodedJson.wsKey]);
            pubSub.publish("LIVELOCATIONS", {
                id: "liveLocation" + user.databaseId,
                buildingDatabaseId: decodedJson.id,
                latitude: decodedJson.latitude,
                longitude: decodedJson.longitude,
                name: decodedJson.name,
                message: decodedJson.message,
            });
            // Sending a ping with the text "Whats Up dog" because I can
            sendPing([0x57, 0x68, 0x61, 0x74, 0x73, 0x20, 0x55, 0x70, 0x20, 0x64, 0x6f, 0x67]);
        } catch (e) {
            // a common error is caused by the input being split up into 2 packets. The system is not prepared for an input of that size.
            console.error(e)
            return
        }
    }

    sock.on('data', data => {
        const dataString = data.toString();
        const dataLines = dataString.split("\r\n");
        if (dataLines[0] == "GET /ws HTTP/1.1") {
            estiblishWsConnection(dataLines);
            return;
        }
        const OPCODE = (data.readUInt8() & 15);
        if (verbose) console.log("OPCODE = " + OPCODE);
        if (OPCODE === 0x9) {
            if (verbose) console.log("Recieved Ping")
            const { dataLength, MASKcode, dataStart } = getPayloadHeader(data);
            const dataBody = data.subarray(dataStart, dataStart + dataLength);
            const DECODED = Uint8Array.from(dataBody, (elt, i) => elt ^ MASKcode[i % 4]); // Perform an XOR on the mask)
            const decodedText = utf8decoder.decode(DECODED);
            if (verbose) console.log("Pong message = " + decodedText)
            sendPong(Array.from(DECODED))
            return;
        }
        if (OPCODE === 0xA) {
            if (verbose) console.log("Recieved Pong")
            const { dataLength, MASKcode, dataStart } = getPayloadHeader(data);
            const dataBody = data.subarray(dataStart, dataStart + dataLength);
            const DECODED = Uint8Array.from(dataBody, (elt, i) => elt ^ MASKcode[i % 4]); // Perform an XOR on the mask)
            const decodedText = utf8decoder.decode(DECODED);
            if (verbose) console.log("Pong message = " + decodedText)
            return;
        }
        receiveLocationSocket(data);
    });

    const sendPing = (message = [0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64]) => {
        if (message.length > 125) {
            throw new Error("message too long")
        }
        const messageLength = (message.length & 15);
        const header = Buffer.from([0x89, messageLength])
        const encodedData = Uint8Array.from(message);
        var mergedArray = new Uint8Array(header.length + encodedData.length);
        mergedArray.set(header);
        mergedArray.set(encodedData, header.length);
        if (verbose) console.log("sending ping length: " + message.length);
        sock.write(mergedArray);
    }

    // I'm finding it hard to test this, looking for a resource that alow me to send arbitray pings from a websocket client.
    const sendPong = (message = [0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64]) => {
        if (message.length > 125) {
            throw new Error("message too long")
        }
        const messageLength = (message.length & 15);
        const header = Buffer.from([0x8A, messageLength])
        const encodedData = Uint8Array.from(message);
        var mergedArray = new Uint8Array(header.length + encodedData.length);
        mergedArray.set(header);
        mergedArray.set(encodedData, header.length);
        if (verbose) console.log("sending pong length: " + message.length);
        sock.write(mergedArray);
    }
});

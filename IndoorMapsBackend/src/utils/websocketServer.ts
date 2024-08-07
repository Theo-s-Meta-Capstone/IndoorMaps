import net from 'net';
import crypto from 'crypto';
import { WebsocketUserTracker } from '../types';
import { getUserOrThrowError } from '../auth/validateUser.js';
import { pubSub } from '../resolvers/pubSub.js';

// false for only essential logging, true for logging of all data related to connections
const verbose = true;

// helper funcitons
function dec2bin(dec: number) {
    return (dec >>> 0).toString(2);
}

const utf8decoder = new TextDecoder(); // default 'utf-8' or 'utf8'

// based on https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers#decoding_payload_length
/**
 * Takes the data received from the client and returns the Mask to be used to decode the data.
 * @param data - the data that was received from the client
 * @returns {MASKcode: number[], dataLength: number, dataStart: number} - the mask, the length of the data, and the start byte of the data in the buffer.
 * The content of the buffer is between (dataStart, dataStart + dataLength)
 */
const getPayloadHeader = (data: Buffer): { MASKcode: number[], dataLength: number, dataStart: number } => {
    const FIN = (data.readUInt8() & 128) >>> 7;
    //OPCODE = 0x0 for continuation, 0x1 for text (which is always encoded in UTF-8), 0x2 for binary
    const OPCODE = (data.readUInt8() & 15);
    const MASK = (data.readUInt8(1) >>> 7);
    // converting from 8 bit number to 7 bit number by anding with 0111 1111 to get rid of the first bit
    let dataLength = data.readUInt8(1) & 127
    const MASKcode = [0, 0, 0, 0];

    if (verbose) {
        console.log(dec2bin(data.readUInt32BE()).padStart(32, "0") + dec2bin(data.readUInt32BE(4)).padStart(32, "0") + " = raw binary data");
        console.log("0     bit 1 number  2         3         4         5         6         7  bit num8er       9        0")
        console.log("0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789")
        console.log(dec2bin(FIN) + " FIN bit ");
        console.log("    " + dec2bin(OPCODE).padStart(4, '0') + " OPCODE ");
        console.log("        " + dec2bin(MASK) + " MASK bit ");
        console.log("         " + dec2bin(dataLength).padStart(7, '0') + " data length = " + dataLength + " (special case if 126 or 127)");
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

const getTextDataFromBuffer = (data: Buffer): string => {
    const { dataLength, MASKcode, dataStart } = getPayloadHeader(data);
    const dataBody = data.subarray(dataStart, dataStart + dataLength);
    const DECODED = Uint8Array.from(dataBody, (elt, i) => elt ^ MASKcode[i % 4]); // Perform an XOR on the mask)
    return utf8decoder.decode(DECODED);
}

const openSockets: WebsocketUserTracker = {};

// implementation based on https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
export const server = net.createServer(sock => {
    const client = sock.remoteAddress;
    if (verbose) console.log('serving stream to ' + client);

    sock.on('data', data => {
        const dataString = data.toString();
        const dataLines = dataString.split("\r\n");
        if (dataLines[0] == "GET /ws HTTP/1.1") {
            establishWsConnection(dataString);
            return;
        }
        if (dataLines[0].split(" ")[1] == "/") {
            if (verbose) console.log(dataLines[0]);
            // this should not happen because / should be redirected to /graphql
            sock.end();
            return;
        }
        const OPCODE = (data.readUInt8() & 15);
        if (verbose) console.log("OPCODE = " + OPCODE);
        // Text Opcode Received
        if (OPCODE === 0x1) {
            receiveLocationSocket(data);
            return;
        }
        // Ping Opcode Received
        if (OPCODE === 0xA) {
            if (verbose) console.log("Received Pong")
            const decodedText = getTextDataFromBuffer(data);
            if (verbose) console.log("Pong message = " + decodedText)
            return;
        }
        // Ping Opcode Received
        if (OPCODE === 0x9) {
            if (verbose) console.log("Received Ping")
            const decodedText = getTextDataFromBuffer(data);
            if (verbose) console.log("Pong message = " + decodedText)
            sendPong(Array.from(decodedText).map((char) => char.charCodeAt(0)));
            return;
        }
        if (verbose) console.log("Received Unhandled Opcode = " + OPCODE);
        try {
            const decodedText = getTextDataFromBuffer(data);
            if (verbose) console.log("Unknown message = " + decodedText)
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.message)
            }
            console.log(dataLines);
        }

    });

    const establishWsConnection = (dataString: string) => {
        // Using Regex to find the needed Https headers, if the match returns null, then the ?? operator returns ["",""] and the [1] can return an empty string
        // This works because . doesn't match new line characters so the second group should only return the rest of the line
        const userWebsocketKey: string = (dataString.match(/sec-websocket-key: (.*)/i)??["",""])[1];
        const cookiesHeader: string = (dataString.match(/cookie: (.*)/i)??["",""])[1];

        if (verbose) console.log("sec-websocket-key request = " + userWebsocketKey)
        let magicString = userWebsocketKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        magicString = crypto.createHash('sha1').update(magicString).digest('base64');

        const wsKey = crypto.randomUUID()
        // match anything that isn't a ; because cookies end with a new line or a ;
        const jwtCookie = (cookiesHeader.match(/jwt=([^;]*)/)??["",""])[1];
        if (!jwtCookie) {
            console.log("no jwt cookie found")
            sock.write(`HTTP/1.1 401 Unauthorized\r\n\r\n`)
            sock.end();
            return;
        }

        openSockets[wsKey] = {
            jwt: jwtCookie,
            timeCreated: Date.now(),
            lastReceived: Date.now(),
        }

        if (verbose) console.log("Sec-WebSocket-Accept computed response = " + magicString)
        sock.write(
            `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${magicString}\r\n\r\n`
        )

        sendMessage(JSON.stringify({ wsKey }))
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
            openSockets[decodedJson.wsKey].lastReceived = Date.now();
            if (verbose) console.log("received json:")
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
        } catch (e) {
            // a common error is caused by the input being split up into 2 packets. The system is not prepared for an input of that size.
            console.error(e)
            return
        }
    }

    const sendMessage = (messageString: string) => {
        if (verbose) console.log("sending message: " + messageString)
        const message = Uint8Array.from(Array.from(messageString).map((char) => char.charCodeAt(0)));
        if (verbose) console.log("sending message: " + message)
        if (message.length > 125) {
            throw new Error("message too long")
        }
        const messageLength = (message.length & 255);
        // 0x81 is 1000 0001 indicating that the message is final (1000) and the opcode is 0001
        const header = Buffer.from([0x81, messageLength])
        const mergedArray = new Uint8Array(header.length + message.length);
        mergedArray.set(header);
        mergedArray.set(message, header.length);
        if (verbose) console.log("sending message length: " + message.length);
        if (verbose) console.log(Buffer.from(mergedArray))
        sock.write(Buffer.from(mergedArray));
    }

    const sendPing = (message = [0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64]) => {
        if (message.length > 125) {
            throw new Error("message too long")
        }
        const messageLength = (message.length & 255);
        const header = Buffer.from([0x89, messageLength])
        const encodedData = Uint8Array.from(message);
        const mergedArray = new Uint8Array(header.length + encodedData.length);
        mergedArray.set(header);
        mergedArray.set(encodedData, header.length);
        if (verbose) console.log("sending ping length: " + message.length);
        sock.write(mergedArray);
    }

    const sendPong = (message = [0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x57, 0x6f, 0x72, 0x6c, 0x64]) => {
        if (message.length > 125) {
            throw new Error("message too long")
        }
        const messageLength = (message.length & 255);
        const header = Buffer.from([0x8A, messageLength])
        const encodedData = Uint8Array.from(message);
        const mergedArray = new Uint8Array(header.length + encodedData.length);
        mergedArray.set(header);
        mergedArray.set(encodedData, header.length);
        if (verbose) console.log("sending pong length: " + message.length);
        sock.write(mergedArray);
    }
});

import net from 'net';
import crypto from 'crypto';

const verbose = true;

function dec2bin(dec: number) {
    return (dec >>> 0).toString(2);
}

const utf8decoder = new TextDecoder(); // default 'utf-8' or 'utf8'


`
The WebSocket Frame
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
    const MASK = (data.readUInt16BE() & 256) >>> 8;
    // converting from 8 bit number to 7 bit number by anding with 0111 1111 to get rid of the first bit
    let dataLength = data.readUInt8(1) & 127
    let MASKcode = [0, 0, 0, 0];

    if (verbose) {
        console.log(dec2bin(data.readUInt32BE()).padStart(32, "0") + dec2bin(data.readUInt32BE(4)).padStart(32, "0"));
        console.log("0         1         2         3         4        5         6         7         8         9")
        console.log("0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890")
        console.log(dec2bin(FIN) + " FIN bit ");
        console.log("    " + dec2bin(OPCODE).padStart(4, '0') + " OPCODE ");
        console.log("        " + dec2bin(MASK) + " MASK bit ");
        console.log("         " + dec2bin(dataLength).padStart(7, '0') + " data length = " + dataLength);
    }
    // The MASK bit tells whether the message is encoded. Messages from the client must be masked, so your server must expect this to be 1. (In fact, section 5.1 of the spec says that your server must disconnect from a client if that client sends an unmasked message.)
    if (MASK != 1) {
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

// implementation based on https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API/Writing_WebSocket_servers
export const server = net.createServer(sock => {
    let client = sock.remoteAddress;
    console.log('serving stream to ' + client);

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

        console.log("sec-websocket-key request = " + userWebsocketKey)
        let magicString = userWebsocketKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
        magicString = crypto.createHash('sha1').update(magicString).digest('base64');

        console.log("Sec-WebSocket-Accept computed response = " + magicString)
        sock.write(
            `HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${magicString}\r\n\r\n`
        )
    }

    sock.on('data', data => {
        const dataString = data.toString();
        const dataLines = dataString.split("\r\n");
        if (dataLines[0] == "GET /ws HTTP/1.1") {
            estiblishWsConnection(dataLines);
            return;
        }
        else {
            try {
                const { dataLength, MASKcode, dataStart } = getPayloadHeader(data);
                if (dataLength + dataStart > data.length) {
                    console.log("data length is too big to be handled by this buffer");
                }
                const dataBody = data.subarray(dataStart, dataStart + dataLength);
                const DECODED = Uint8Array.from(dataBody, (elt, i) => elt ^ MASKcode[i % 4]); // Perform an XOR on the mask)
                const decodedText = utf8decoder.decode(DECODED);
            } catch (e) {
                // a common error is caused by the input being split up into 2 packets. The system is not prepared for an input of that size.
                console.error(e)
                return
            }
        }
    });
});

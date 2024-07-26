import { describe, expect, beforeAll, afterAll, it, jest } from '@jest/globals';
import request from 'supertest';
import { httpServer } from '../server';
import { seed } from '../utils/seed';
import { server } from "../utils/websocketServer.js";
import WebSocket from 'ws';
import { timeout } from '../utils/generic';

// port is different then the other tests so the tests can run in parallel
const port = 4503;
const date = new Date();
const testDate = date.toLocaleDateString() + " " + date.toLocaleTimeString();
const testBuildingName = "testBuilding" + testDate;

describe('Testing the ws server and GraphQL server by running a HttpServer and websocketServer', () => {
    let url = "";

    // before the tests we spin up a new Apollo Server
    beforeAll(async () => {
        // Note we must wrap our object destructuring in parentheses because we already declared these variables
        // We pass in the port as 0 to let the server pick its own ephemeral port for testing
        httpServer.listen({ port: port });
        server.listen({ port: port + 1000 });

        url = `http://localhost:${port}/graphql`

        await seed();
        await timeout(1000);
    // Sometimes starting the server takes longer then the standard 5 seconds
    }, 15 * 1000);

    // after the tests we'll stop the server
    afterAll(async () => {
        httpServer.close();
    });

    let cookie = "";

    const createUserQueryData = {
        query: `
        mutation Mutation($data: UserCreateInput!) {
            signupUser(data: $data) {
              id
              email
              name
              isEmailVerified
            }
          }
        `,
        variables: {
            "data": {
                "password": "pass",
                "name": testBuildingName + "liveLocationSharer",
                "email": testBuildingName + "liveLocationSharer" + "@test.com"
            }
        },
    }

    it('Create new user', async () => {
        // send our request to the url of the test server
        const response = await request(url).post('/').send(createUserQueryData);
        expect(response.error).toEqual(false);
        expect(response.body.data?.signupUser.id).toBeDefined();
        expect(response.body.data?.signupUser.name).toEqual(testBuildingName + "liveLocationSharer");
        expect(response.body.data?.signupUser.isEmailVerified).toEqual(false);
        cookie = response.headers['set-cookie'][0];
    });

    it("open and close a websocket connection", async () => {
        const ws = new WebSocket(`ws://localhost:${port + 1000}/ws`, { headers: { 'cookie': cookie } });
        const handler = jest.fn()

        const promiseA = new Promise<void>((resolve, reject) => {
            ws.on('message', (message) => {
                expect(message.toString()).toContain("wsKey");
                handler()
                ws.close();
                resolve();
            });

            ws.on('error', (error) => {
                reject(error);
            });
        });

        await promiseA

        expect(handler).toBeCalledTimes(1)
    });

    it("send a packet and a ping over the ws", async () => {
        const ws = new WebSocket(`ws://localhost:${port + 1000}/ws`, { headers: { 'cookie': cookie } });
        const handler = jest.fn()

        const promiseA = new Promise<void>((resolve, reject) => {
            ws.on('message', (message) => {
                const key = JSON.parse(message.toString()).wsKey;
                ws.send(`{"wsKey":"${key}","id":1,"latitude":37.4852513,"longitude":-122.1471655,"name":"Theo","message":""}`)

                ws.ping();

                handler();
                setTimeout(()=>resolve(), 300)

            });

            ws.on('error', (error) => {
                reject(error);
            });
        });

        await promiseA

        expect(handler).toBeCalledTimes(1)
    });

    it("send a get request to the ws without a cookie", async () => {
        const response = await request(`http://localhost:${port + 1000}`).get('/ws');
        expect(response.statusCode).toEqual(401);
    });

});

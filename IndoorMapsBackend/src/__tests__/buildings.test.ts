import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';

// we'll use supertest to test our server
import request from 'supertest';
import { httpServer } from '../server';
import { seed } from '../utils/seed';

// port is different then the other tests so the tests can run in parallel
const port = 4501;

const date = new Date();
const testDate = date.toLocaleDateString() + " " + date.toLocaleTimeString();
const testBuildingName = "testBuilding" + testDate;


describe('Testing the GraphQL server by running a HttpServer', () => {
    let url = "";
    let seedUserId: number;
    let buildingId: string;

    // before the tests we spin up a new Apollo Server
    beforeAll(async () => {
        // Note we must wrap our object destructuring in parentheses because we already declared these variables
        // We pass in the port as 0 to let the server pick its own ephemeral port for testing
        httpServer.listen({ port: port });
        url = `http://localhost:${port}/graphql`

        // ensures that there is a user in the db to own the building
        seedUserId = await seed();
        console.log(seedUserId)
    });

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
                "name": testBuildingName+"creator",
                "email": testBuildingName+"creator" + "@test.com"
            }
        },
    }

    it('Create new user', async () => {
        // send our request to the url of the test server
        const response = await request(url).post('/').send(createUserQueryData);
        expect(response.error).toEqual(false);
        expect(response.body.data?.signupUser.id).toBeDefined();
        expect(response.body.data?.signupUser.name).toEqual(testBuildingName+"creator");
        expect(response.body.data?.signupUser.isEmailVerified).toEqual(false);
        cookie = response.headers['set-cookie'][0];
    });

    it('Create a building', async () => {
        // this is the query for our test
        const createBuildingQuery = {
            query: `
            mutation Mutation($data: BuildingCreateInput!) {
                createBuilding(data: $data) {
                id
                title
                floors {
                    id
                    title
                    description
                }
                }
            }
        `,
            variables: {
                "data": {
                    "title": testBuildingName,
                    "address": "1 hacker way, CA, USA, Earth",
                    "startLat": 4,
                    "startLon": 4
                }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').set('Cookie', [cookie]).send(createBuildingQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.createBuilding.title).toEqual(testBuildingName);
        buildingId = response.body.data?.createBuilding.id
    });


    it('Get All buildings', async () => {
        // this is the query for our test
        const getAllBuildingQuery = {
            query: `
            query Query {
                allBuildings {
                  id
                  title
                  floors {
                    id
                    title
                    description
                  }
                }
              }
        `,
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(getAllBuildingQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.allBuildings).toBeInstanceOf(Array);
        expect(response.body.data?.allBuildings.findIndex((value: any) => value.title == testBuildingName)).toBeGreaterThan(-1);
    });

    it('Get single building', async () => {
        // this is the query for our test
        const getSingleBuildingQuery = {
            query: `
            query GetBuilding($data: BuildingUniqueInput!) {
                getBuilding(data: $data) {
                  id
                  title
                  floors {
                    id
                    title
                    description
                  }
                }
              }
        `,
        variables: {
            "data": {
                "id": parseInt(buildingId.substring("building".length)),
              }
        },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(getSingleBuildingQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getBuilding.title).toEqual(testBuildingName);
    });



});

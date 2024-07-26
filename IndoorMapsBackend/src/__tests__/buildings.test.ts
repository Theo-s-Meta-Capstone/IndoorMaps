import { describe, expect, beforeAll, afterAll, it, jest } from '@jest/globals';
import request from 'supertest';
import { httpServer } from '../server';
import { seed } from '../utils/seed';
import { timeout } from '../utils/generic';

// port is different then the other tests so the tests can run in parallel
const port = 4501;
const date = new Date();
const testDate = date.toLocaleDateString() + " " + date.toLocaleTimeString();
const testBuildingName = "testBuilding" + testDate;
jest.setTimeout(3 * 60 * 1000);

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
        // Sometimes starting the server takes longer then the standard 5 seconds
        await timeout(1000);
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
                "name": testBuildingName + "creator",
                "email": testBuildingName + "creator" + "@test.com"
            }
        },
    }

    it('Create new user', async () => {
        // send our request to the url of the test server
        const response = await request(url).post('/').send(createUserQueryData);
        expect(response.error).toEqual(false);
        expect(response.body.data?.signupUser.id).toBeDefined();
        expect(response.body.data?.signupUser.name).toEqual(testBuildingName + "creator");
        expect(response.body.data?.signupUser.isEmailVerified).toEqual(false);
        cookie = response.headers['set-cookie'][0];
    });

    // The following tests get all return fields possible inorder to test field resolvers (which only run when asked for)
    it('Create a building', async () => {
        // this is the query for our test
        const createBuildingQuery = {
            query: `
            mutation Mutation($data: BuildingCreateInput!) {
                createBuilding(data: $data) {
                    id
                    databaseId
                    title
                    startPos {
                      lat
                      lon
                    }
                    address
                    floors {
                      id
                      databaseId
                      title
                      description
                      shape
                      areas {
                        id
                        databaseId
                        title
                        description
                        shape
                        traversable
                        category
                      }
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
                allBuildings(data: {}) {
                    id
                    databaseId
                    title
                    startPos {
                      lat
                      lon
                    }
                    address
                    floors {
                      id
                      databaseId
                      title
                      description
                      shape
                      areas {
                        id
                        databaseId
                        title
                        description
                        shape
                        traversable
                        category
                      }
                    }
                  }
              }
        `,
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(getAllBuildingQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.allBuildings).toBeInstanceOf(Array);
        expect(response.body.data?.allBuildings.findIndex((value: { title: string }) => value.title == testBuildingName)).toBeGreaterThan(-1);
    });

    it('Get single building', async () => {
        // this is the query for our test
        const getSingleBuildingQuery = {
            query: `
            query GetBuilding($data: BuildingUniqueInput!) {
                getBuilding(data: $data)  {
                    id
                    databaseId
                    title
                    startPos {
                      lat
                      lon
                    }
                    address
                    floors {
                      id
                      databaseId
                      title
                      description
                      shape
                      areas {
                        id
                        databaseId
                        title
                        description
                        shape
                        traversable
                        category
                      }
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

    let floorDatabaseId = -1;

    it('Create floor on new building', async () => {
        // used generic name testQuery to make it easier to copy and paste
        const testQuery = {
            query: `
            mutation CreateFloor($data: FloorCreateInput!) {
                createFloor(data: $data) {
                  success
                  databaseId
                  buildingDatabaseId
                }
              }
        `,
            variables: {
                "data": {
                    "title": "newFlo",
                    "description": "newFloorFromTestnewFloorFromTestnewFloorFromTestnewFloorFromTestnewFloorFromTestnewFloorFromTest",
                    "buildingDatabseId": parseInt(buildingId.substring("building".length)),
                }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').set('Cookie', [cookie]).send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.createFloor.buildingDatabaseId).toEqual(parseInt(buildingId.substring("building".length)));
        floorDatabaseId = response.body.data?.createFloor.databaseId
    });

    it('Get floor', async () => {
        const testQuery = {
            query: `
            query Query($data: FloorUniqueInput!) {
                getFloor(data: $data) {
                  id
                  databaseId
                  title
                  description
                  shape
                  areas {
                    id
                    databaseId
                    title
                    description
                    shape
                    traversable
                    category
                  }
                }
              }
        `,
            variables: {
                "data": {
                    "id": floorDatabaseId
                }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').set('Cookie', [cookie]).send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getFloor.databaseId).toEqual(floorDatabaseId);
        expect(response.body.data?.getFloor.shape).toBeNull();
    });

    it('Modify floor', async () => {
        // used generic name testQuery to make it easier to copy and paste
        const testQuery = {
            query: `
            mutation Mutation($data: FloorModifyInput!) {
                modifyFloor(data: $data) {
                  databaseId
                }
              }
        `,
            variables: {
                "data": {
                    "id": floorDatabaseId,
                    "title": "Diff",
                    "description": "New Description",
                    "newShape": {
                        "shape": JSON.stringify({ "type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [[[-77.7637, 39.78075], [-77.764304, 39.780311], [-77.763022, 39.780193], [-77.7637, 39.78075]]] }, "properties": {} }, { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-77.763435, 39.780393] }, "properties": {} }] })
                    }
                }
            }
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').set('Cookie', [cookie]).send(testQuery);
        expect(response.error).toEqual(false);
    });

    it('Get floor with new data', async () => {
        const testQuery = {
            query: `
            query Query($data: FloorUniqueInput!) {
                getFloor(data: $data) {
                  id
                  databaseId
                  title
                  description
                  shape
                  areas {
                    id
                    databaseId
                    title
                    description
                    shape
                    traversable
                    category
                  }
                }
              }
        `,
            variables: {
                "data": {
                    "id": floorDatabaseId
                }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').set('Cookie', [cookie]).send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getFloor.databaseId).toEqual(floorDatabaseId);
        expect(response.body.data?.getFloor.description).toEqual("New Description");
        expect(response.body.data?.getFloor.shape).toBeDefined();
    });

    let areaDatabaseId = -1;
    it('Create new area', async () => {
        const testQuery = {
            query: `
            mutation Mutation($data: AreaCreateInput!) {
                createArea(data: $data) {
                  success
                  databaseId
                  floorDatabaseId
                }
              }
        `,
            variables: {
                "data": {
                    "floorDatabseId": floorDatabaseId,
                    "title": "testArea",
                    "description": "testAreaDescription",
                    "shape": JSON.stringify({ "type": "FeatureCollection", "features": [{ "type": "Feature", "geometry": { "type": "Polygon", "coordinates": [[[-77.7637, 39.78075], [-77.764304, 39.780311], [-77.763022, 39.780193], [-77.7637, 39.78075]]] }, "properties": {} }, { "type": "Feature", "geometry": { "type": "Point", "coordinates": [-77.763435, 39.780393] }, "properties": {} }] }),
                    "buildingDatabaseId": parseInt(buildingId.substring("building".length))
                }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').set('Cookie', [cookie]).send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.createArea.success).toEqual(true);
        areaDatabaseId = response.body.data?.createArea.databaseId
    });

    it('Modify new area', async () => {
        const testQuery = {
            query: `
            mutation ModifyArea($data: AreaModifyInput!) {
                modifyArea(data: $data) {
                  success
                  databaseId
                  floorDatabaseId
                }
              }
        `,
            variables: {
                "data": {
                    "id": areaDatabaseId,
                    "title": "editedArea",
                    "description": "different",
                    "category": "different",
                }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').set('Cookie', [cookie]).send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.modifyArea.success).toEqual(true);
    });

    it('Get the new area', async () => {
        const testQuery = {
            query: `
            query Query($data: AreaUniqueInput!) {
                getArea(data: $data) {
                  id
                  databaseId
                  title
                  description
                  shape
                  traversable
                  category
                }
              }
        `,
            variables: {
                "data": {
                    "id": areaDatabaseId,
                }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').set('Cookie', [cookie]).send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getArea.description).toEqual("different");
        expect(response.body.data?.getArea.category).toEqual("different");
        expect(response.body.data?.getArea.shape).toBeDefined();
        expect(response.body.data?.getArea.title).toEqual("editedArea");

    });
});

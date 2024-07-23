import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';
import request from 'supertest';
import { httpServer } from '../server';

const port = 4504;

const date = new Date();
const testDate = date.toLocaleDateString() + " " + date.toLocaleTimeString();

describe('Testing the Navigation Resolver and helper functions', () => {
    let url = "";
    const buildingId: number = 1;

    // before the tests we spin up a new Apollo Server
    beforeAll(async () => {
        // Note we must wrap our object destructuring in parentheses because we already declared these variables
        // We pass in the port as 0 to let the server pick its own ephemeral port for testing
        httpServer.listen({ port: port });
        url = `http://localhost:${port}/graphql`
    });

    // after the tests we'll stop the server
    afterAll(async () => {
        httpServer.close();
    });

    it('Get Path Standard', async () => {
        const testQuery = {
            query: `
            query GetNavBetweenAreas($data: NavigationInput!) {
                getNavBetweenAreas(data: $data) {
                  path {
                    lat
                    lon
                  }
                  neededToGenerateANavMesh
                  distance
                  walls
                  navMesh
                }
              }
        `,
            variables: {
                "data": {
                    "floorDatabaseId": 1,
                    "areaToId": 129, // cafe
                    "areaFromId": 120, // English 103
                    "locationFromLat": 37.485163351464315,
                    "locationFromLon": -122.1478436920193,
                    "pathfindingMethod": "Standard"
                  }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getNavBetweenAreas.path).toBeInstanceOf(Array);
    });

    it('Get Path Voronoi', async () => {
        const testQuery = {
            query: `
            query GetNavBetweenAreas($data: NavigationInput!) {
                getNavBetweenAreas(data: $data) {
                  path {
                    lat
                    lon
                  }
                  neededToGenerateANavMesh
                  distance
                  walls
                  navMesh
                }
              }
        `,
            variables: {
                "data": {
                    "floorDatabaseId": 1,
                    "areaToId": 129, // cafe
                    "areaFromId": 120, // English 103
                    "locationFromLat": 37.485163351464315,
                    "locationFromLon": -122.1478436920193,
                    "pathfindingMethod": "Voronoi"
                  }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getNavBetweenAreas.path).toBeInstanceOf(Array);
    });

    it('Get Path Standard w/ Cashed Nav Mesh', async () => {
        const testQuery = {
            query: `
            query GetNavBetweenAreas($data: NavigationInput!) {
                getNavBetweenAreas(data: $data) {
                  path {
                    lat
                    lon
                  }
                  neededToGenerateANavMesh
                  distance
                  walls
                  navMesh
                }
              }
        `,
            variables: {
                "data": {
                    "floorDatabaseId": 1,
                    "areaToId": 129, // cafe
                    "areaFromId": 120, // English 103
                    "locationFromLat": 37.485163351464315,
                    "locationFromLon": -122.1478436920193,
                    "pathfindingMethod": "Standard"
                  }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getNavBetweenAreas.path).toBeInstanceOf(Array);
    });

    it('Get Path Voronoi w/ Cashed Nav Mesh', async () => {
        const testQuery = {
            query: `
            query GetNavBetweenAreas($data: NavigationInput!) {
                getNavBetweenAreas(data: $data) {
                  path {
                    lat
                    lon
                  }
                  neededToGenerateANavMesh
                  distance
                  walls
                  navMesh
                }
              }
        `,
            variables: {
                "data": {
                    "floorDatabaseId": 1,
                    "areaToId": 129, // cafe
                    "areaFromId": 120, // English 103
                    "locationFromLat": 37.485163351464315,
                    "locationFromLon": -122.1478436920193,
                    "pathfindingMethod": "Voronoi"
                  }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getNavBetweenAreas.path).toBeInstanceOf(Array);
    });
});

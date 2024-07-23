import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';
import request from 'supertest';
import { httpServer } from '../server';

const port = 4504;

describe('Testing the Navigation Resolver and helper functions', () => {
    let url = "";

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
                    "pathfindingMethod": "Standard"
                  }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getNavBetweenAreas.path).toBeInstanceOf(Array);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeGreaterThan(0);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeLessThan(3);
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
                    "pathfindingMethod": "Voronoi"
                  }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getNavBetweenAreas.path).toBeInstanceOf(Array);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeGreaterThan(0);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeLessThan(3);
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
                    "pathfindingMethod": "Standard"
                  }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getNavBetweenAreas.path).toBeInstanceOf(Array);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeGreaterThan(0);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeLessThan(3);
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
                    "pathfindingMethod": "Voronoi"
                  }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getNavBetweenAreas.path).toBeInstanceOf(Array);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeGreaterThan(0);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeLessThan(3);
    });

    it('Get Path from gps Standard', async () => {
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
        expect(response.body.data?.getNavBetweenAreas.distance).toBeGreaterThan(0);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeLessThan(3);
    });

    it('Get Path from gps Voronoi', async () => {
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
        expect(response.body.data?.getNavBetweenAreas.distance).toBeGreaterThan(0);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeLessThan(3);
    });

    it('Get Path to gps Standard', async () => {
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
                    "areaFromId": 129, // cafe
                    "locationToLat": 37.485163351464315,
                    "locationToLon": -122.1478436920193,
                    "pathfindingMethod": "Standard"
                  }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getNavBetweenAreas.path).toBeInstanceOf(Array);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeGreaterThan(0);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeLessThan(3);
    });

    it('Get Path from gps Voronoi', async () => {
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
                    "areaFromId": 129, // cafe
                    "locationToLat": 37.485163351464315,
                    "locationToLon": -122.1478436920193,
                    "pathfindingMethod": "Voronoi"
                  }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getNavBetweenAreas.path).toBeInstanceOf(Array);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeGreaterThan(0);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeLessThan(3);
    });


    it('Get Path gps <-> gps Standard', async () => {
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
                    "locationFromLat": 37.48557406208134,
                    "locationFromLon": -122.14679174723355,
                    "locationToLat": 37.484602650313676,
                    "locationToLon": -122.14719320334484,
                    "pathfindingMethod": "Standard"
                  }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getNavBetweenAreas.path).toBeInstanceOf(Array);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeGreaterThan(0);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeLessThan(3);
    });

    it('Get Path gps <-> gps Voronoi', async () => {
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
                    "locationFromLat": 37.48557406208134,
                    "locationFromLon": -122.14679174723355,
                    "locationToLat": 37.484602650313676,
                    "locationToLon": -122.14719320334484,
                    "pathfindingMethod": "Voronoi"
                  }
            },
        };
        // send our request to the url of the test server
        const response = await request(url).post('/').send(testQuery);
        expect(response.error).toEqual(false);
        expect(response.body.data?.getNavBetweenAreas.path).toBeInstanceOf(Array);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeGreaterThan(0);
        expect(response.body.data?.getNavBetweenAreas.distance).toBeLessThan(3);
    });
});

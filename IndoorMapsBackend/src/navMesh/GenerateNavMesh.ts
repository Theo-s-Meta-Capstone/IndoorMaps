import { Area, Prisma } from "@prisma/client";
import { doIntersect } from "./doIntersect.js";
import { LatLng } from "../graphqlSchemaTypes/Building.js";
import { areWallsEqual, getDistanceBetweenGPSPoints, vorornoiDriver } from "./helpers.js";
import GrahamScan from "@lucio/graham-scan"
import { PathfindingMethod } from "../resolvers/NavResolver.js";
import { Position } from "geojson";

const feetPerLatitudeDegree = 364000;
const oneFootInLatitude = 1 / feetPerLatitudeDegree;
const offsetInDegrees = oneFootInLatitude
const floorPlanOffsetWeight = 3;

export type FloorIncludeAreas = Prisma.FloorGetPayload<{
    include: {
        areas: true
    }
}>

export class Wall {
    point1: LatLng
    point2: LatLng
    constructor(point1: LatLng, point2: LatLng) {
        this.point1 = point1;
        this.point2 = point2
    }
}

export class EdgeWithWeight {
    weight: number
    index: number
    constructor(index: number, weight: number) {
        this.weight = weight;
        this.index = index;
    }
}

export type NavMeshVertex = {
    index: number
    point: LatLng
    edges: EdgeWithWeight[]
}

export type NavMesh = NavMeshVertex[]

const grahamScan = (points: LatLng[]): LatLng[] => {
    const grahamScan = new GrahamScan();
    grahamScan.setPoints(points.map(point => [point.lat, point.lon]));
    return grahamScan.getHull().map((point: number[]) => new LatLng(point[0], point[1]));
}

const expandPolygon = (polygon: Position[], offset: number) => {
    return grahamScan(polygon.flatMap((pos) => {
        return [
            new LatLng(pos[1], pos[0]),
            new LatLng(pos[1] + offset, pos[0] + offset),
            new LatLng(pos[1] + offset, pos[0] - offset),
            new LatLng(pos[1] - offset, pos[0] + offset),
            new LatLng(pos[1] -offset, pos[0] - offset),
            new LatLng(pos[1] + offset, pos[0]),
            new LatLng(pos[1] - offset, pos[0]),
            new LatLng(pos[1], pos[0] + offset),
            new LatLng(pos[1], pos[0] - offset),
        ]
    }))
}

export const generateNavMesh = (floor: FloorIncludeAreas, vertexMethod: PathfindingMethod): [NavMesh, Wall[]] => {
    const floorGeoJSON: GeoJSON.FeatureCollection = floor.shape as unknown as GeoJSON.FeatureCollection;
    // The floor contains may doors (which are type Marker) and 1 outline (which is type shape)
    const floorOutline = floorGeoJSON.features.find((feature) => feature.geometry.type === "Polygon") as GeoJSON.Feature<GeoJSON.Polygon> | undefined;
    const offsetWithWeight = offsetInDegrees * (vertexMethod === "Standard" ? 3 : .8);
    const walls: Wall[] = [];
    let vertices: LatLng[] = [];
    let floorWalls: Wall[] = [];
    if (floorOutline) {
        const coords = floorOutline.geometry.coordinates[0]
        floorWalls = coords.flatMap((pos, i) => {
            return new Wall(new LatLng(pos[1], pos[0]), new LatLng(coords[(i + 1) % coords.length][1], coords[(i + 1) % coords.length][0]))
        })
        walls.push(...floorWalls)
        vertices = coords.flatMap((pos) => {
            return new LatLng(pos[1], pos[0])
        }).concat(
            // adds outside verticies to help with navigation from outside a building
            ...expandPolygon(coords, offsetInDegrees * floorPlanOffsetWeight)
        )
    }
    // Using the Naïve algo (n^3) based on https://www.cs.kent.edu/~dragan/ST-Spring2016/visibility%20graphs.pdf
    // A better time complexity can be achived using the n^2*log(n) algo specified here: https://github.com/davetcoleman/visibility_graph/blob/master/Visibility_Graph_Algorithm.pdf
    // There is also a JS lib that implements the https://github.com/rowanwins/visibility-graph
    const expandedPolygons: LatLng[][] = (floor.areas.map((area) => {
        if (area.traversable) return undefined;
        if (area.shape instanceof Object) {
            const geoJsonShape = area.shape as unknown as GeoJSON.Feature<GeoJSON.Polygon>;
            // I think that each set of coordinates can hold multiple polygons but since we only ever store 1 polygon it is safe to index into [0]
            return geoJsonShape.geometry.coordinates[0]
        }
    })
        .filter((point) => point !== undefined) as GeoJSON.Position[][])
        .map((posArr) => {
            return expandPolygon(posArr, offsetWithWeight)
        })

    const realPolygons: LatLng[][] = (floor.areas.map((area) => {
        if (area.traversable) return undefined;
        if (area.shape instanceof Object) {
            const geoJsonShape = area.shape as unknown as GeoJSON.Feature<GeoJSON.Polygon>;
            // I think that each set of coordinates can hold multiple polygons but since we only ever store 1 polygon it is safe to index into [0]
            return geoJsonShape.geometry.coordinates[0]
        }
    })
        .filter((point) => point !== undefined) as GeoJSON.Position[][])
        .map((posArr) => {
            return posArr.map((pos) => new LatLng(pos[1], pos[0]))
        })

    let wallsToUse = walls;
    if (vertexMethod === "Standard") {
        vertices.push(...expandedPolygons.flatMap((polygon) => {
            return polygon.map((latLng) => latLng)
        })
        )
    } else {
        vertices.push(
            ...vorornoiDriver(
                realPolygons.flatMap((polygon) => {
                    return polygon.map((latLng) => latLng)
                })
            )
        )

        wallsToUse = walls.concat(expandedPolygons.flatMap((polygon) => {
            return polygon.map((latLng, i) => new Wall(latLng, polygon[(i + 1) % polygon.length]))
        }))
    }

    walls.push(...realPolygons.flatMap((polygon) => {
        return polygon.map((latLng, i) => new Wall(latLng, polygon[(i + 1) % polygon.length]))
    }))

    const navMesh: NavMesh = [];
    extendNavMesh(navMesh, wallsToUse, vertices)

    const wallsExcludingFloorWalls = wallsToUse.filter((wall) => !floorWalls.some((floorWall) => areWallsEqual(floorWall, wall)))
    floorGeoJSON.features.forEach((feature) => {
        if (feature.geometry.type === "Point") {
            const point = new LatLng(feature.geometry.coordinates[1], feature.geometry.coordinates[0]);
            addPointToNavMesh(navMesh, wallsExcludingFloorWalls, point)
        }
    })

    return [navMesh, walls] as const
}

const addPointToNavMesh = (navMesh: NavMesh, walls: Wall[], start: LatLng) => {
    const newEdges: EdgeWithWeight[] = [];
    for (let otherVertexIndex = 0; otherVertexIndex < navMesh.length; otherVertexIndex++) {
        const doesNotCrossAnyWalls = walls.findIndex((wall) => doIntersect(start, navMesh[otherVertexIndex].point, wall)) === -1;
        if (doesNotCrossAnyWalls) {
            newEdges.push(new EdgeWithWeight(otherVertexIndex, getDistanceBetweenGPSPoints(start, navMesh[otherVertexIndex].point)))
        }
    }
    navMesh.push({
        index: navMesh.length,
        point: start,
        edges: newEdges,
    })
    // add the new edges to their respective counter part (the graph is directional due to it's implementation, this makes sure that both directions exist)
    newEdges.forEach((edge) => {
        navMesh[edge.index].edges.push(new EdgeWithWeight(navMesh.length - 1, getDistanceBetweenGPSPoints(start, navMesh[edge.index].point)))
    })
}

export const extendNavMesh = (navMesh: NavMesh, walls: Wall[], newPoints: LatLng[]) => {
    newPoints.forEach((newPoint) => addPointToNavMesh(navMesh, walls, newPoint))
}

export const addAreaToMesh = (navMesh: NavMesh, area: Area | undefined, wallsExcludingIgnorable: Wall[], point: LatLng): number => {
    if (area && area.entrances !== null) {
        const entrancesCollection = (area.entrances as unknown as GeoJSON.FeatureCollection).features.filter((entrance) => entrance.geometry.type === "Point") as GeoJSON.Feature<GeoJSON.Point>[];
        const beginningOfNewVerities = navMesh.length;
        extendNavMesh(navMesh, wallsExcludingIgnorable, entrancesCollection.map((entrance) => new LatLng(entrance.geometry.coordinates[1], entrance.geometry.coordinates[0])));
        const edges = [];
        for (let i = beginningOfNewVerities; i < navMesh.length; i++) {
            edges.push(new EdgeWithWeight(i, getDistanceBetweenGPSPoints(point, navMesh[i].point)))
            navMesh[i].edges.push(new EdgeWithWeight(navMesh.length, getDistanceBetweenGPSPoints(point, navMesh[i].point)))
        }
        navMesh.push({
            point,
            index: navMesh.length,
            edges,
        })

        return navMesh.length - 1;
    }
    extendNavMesh(navMesh, wallsExcludingIgnorable, [point]);
    return navMesh.length - 1;
}

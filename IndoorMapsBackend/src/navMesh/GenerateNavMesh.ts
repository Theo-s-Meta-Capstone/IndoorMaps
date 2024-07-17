import { Prisma } from "@prisma/client";
import { doIntersect } from "./doIntersect.js";
import { LatLng } from "../graphqlSchemaTypes/Building.js";
import { getDistanceBetweenGPSPoints } from "./helpers.js";
import GrahamScan from "@lucio/graham-scan"

const feetPerLatitudeDegree = 364000;
const oneFootInLatitude = 1 / feetPerLatitudeDegree;
const offsetInDegrees = oneFootInLatitude*4
const sqrt2aprox = 1.42

type FloorIncludeAreas = Prisma.FloorGetPayload<{
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

class EdgeWithWeight {
    otherVertex: NavMeshVertex
    weight: number
    index: number
    constructor(otherVertex: NavMeshVertex, weight: number, index: number) {
        this.otherVertex = otherVertex;
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

export const generateNavMesh = (floor: FloorIncludeAreas): [NavMesh, Wall[]] => {
    const floorGeoJSON: GeoJSON.FeatureCollection = floor.shape as unknown as GeoJSON.FeatureCollection;
    // The floor contains may doors (which are type Marker) and 1 outline (which is type shape)
    const floorOutline = floorGeoJSON.features.find((feature) => feature.geometry.type === "Polygon") as GeoJSON.Feature<GeoJSON.Polygon>;
    let walls: Wall[] = [];
    let vertices: LatLng[] = [];
    if (floorOutline) {
        const coords = floorOutline.geometry.coordinates[0]
        walls = coords.flatMap((pos, i) => {
            return new Wall(new LatLng(pos[1], pos[0]), new LatLng(coords[(i + 1) % coords.length][1], coords[(i + 1) % coords.length][0]))
        })
        vertices = coords.flatMap((pos, i) => {
            return new LatLng(pos[1], pos[0])
        })
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
            return grahamScan(posArr.flatMap((pos) => {
                return [
                    new LatLng(pos[1], pos[0]),
                    new LatLng(pos[1] + offsetInDegrees, pos[0] + offsetInDegrees),
                    new LatLng(pos[1] + offsetInDegrees, pos[0] - offsetInDegrees),
                    new LatLng(pos[1] - offsetInDegrees, pos[0] + offsetInDegrees),
                    new LatLng(pos[1] - offsetInDegrees, pos[0] - offsetInDegrees),
                    new LatLng(pos[1] + offsetInDegrees*sqrt2aprox, pos[0]),
                    new LatLng(pos[1] - offsetInDegrees*sqrt2aprox, pos[0]),
                    new LatLng(pos[1], pos[0] + offsetInDegrees*sqrt2aprox),
                    new LatLng(pos[1], pos[0] - offsetInDegrees*sqrt2aprox),
                ]
            }))
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

    walls.push(...realPolygons.flatMap((polygon) => {
        return polygon.map((latLng, i) => new Wall(latLng, polygon[(i + 1) % polygon.length]))
    }))

    vertices.push(...expandedPolygons.flatMap((polygon) => {
        return polygon.map((latLng) => latLng)
    }))

    let navMesh: NavMesh = vertices.map((vertex, i): NavMeshVertex => {
        return {
            index: i,
            point: vertex,
            edges: [],
        }
    })

    for (let i = 0; i < navMesh.length; i++) {
        for (let otherVertexIndex = 0; otherVertexIndex < navMesh.length; otherVertexIndex++) {
            let doesNotCrossAnyWalls = walls.findIndex((wall) => doIntersect(navMesh[i].point, navMesh[otherVertexIndex].point, wall)) === -1;
            if (doesNotCrossAnyWalls) {
                navMesh[i].edges.push(new EdgeWithWeight(navMesh[otherVertexIndex], getDistanceBetweenGPSPoints(navMesh[i].point, navMesh[otherVertexIndex].point), otherVertexIndex))
            }
        }
    }

    return [navMesh, walls] as const
}

const addPointToNavMesh = (navMesh: NavMesh, walls: Wall[], start: LatLng) => {
    let newEdges: EdgeWithWeight[] = [];
    for (let otherVertexIndex = 0; otherVertexIndex < navMesh.length; otherVertexIndex++) {
        let doesNotCrossAnyWalls = walls.findIndex((wall) => doIntersect(start, navMesh[otherVertexIndex].point, wall)) === -1;
        if (doesNotCrossAnyWalls) {
            newEdges.push(new EdgeWithWeight(navMesh[otherVertexIndex], getDistanceBetweenGPSPoints(start, navMesh[otherVertexIndex].point), otherVertexIndex))
        }
    }
    navMesh.push({
        index: navMesh.length,
        point: start,
        edges: newEdges,
    })
    // add the new edges to their respective counter part (the graph is directional due to it's implementation, this makes sure that both directions exist)
    newEdges.forEach((edge) => {
        edge.otherVertex.edges.push(new EdgeWithWeight(navMesh[navMesh.length - 1], getDistanceBetweenGPSPoints(start, edge.otherVertex.point), navMesh.length - 1))
    })
}

export const extendNavMesh = (navMesh: NavMesh, walls: Wall[], newPoints: LatLng[]) => {
    newPoints.forEach(newPoint => addPointToNavMesh(navMesh, walls, newPoint))
}

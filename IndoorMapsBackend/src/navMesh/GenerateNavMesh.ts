import { Prisma } from "@prisma/client";
import { doIntersect, intersects } from "./doIntersect.js";
import { LatLng } from "../graphqlSchemaTypes/Building.js";
import { getDistanceBetweenGPSPoints } from "./helpers.js";

type FloorIncludeAreas = Prisma.FloorGetPayload<{
    include: {
        areas: true
    }
}>

type JsonObject = Prisma.JsonObject;

export class Edge {
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

export const generateNavMesh = (floor: FloorIncludeAreas): [NavMesh, Edge[]] => {
    const floorGeoJSON: GeoJSON.FeatureCollection = floor.shape as unknown as GeoJSON.FeatureCollection;
    // The floor contains may doors (which are type Marker) and 1 outline (which is type shape)
    const floorOutline = floorGeoJSON.features.find((feature) => feature.geometry.type === "Polygon");
    let edges: Edge[] = [];
    let vertices: LatLng[] = [];
    if (floorOutline && floorOutline.geometry.type === "Polygon") {
        const coords = floorOutline.geometry.coordinates[0]
        edges = coords.flatMap((pos, i) => {
            return new Edge(new LatLng(pos[1], pos[0]), new LatLng(coords[(i + 1) % coords.length][1], coords[(i + 1) % coords.length][0]))
        })
        vertices = coords.flatMap((pos, i) => {
            return new LatLng(pos[1], pos[0])
        })
    }
    // Using the Naïve algo (n^3) based on https://www.cs.kent.edu/~dragan/ST-Spring2016/visibility%20graphs.pdf
    // A better time complexity can be achived using the n^2*log(n) algo specified here: https://github.com/davetcoleman/visibility_graph/blob/master/Visibility_Graph_Algorithm.pdf
    // There is also a JS lib that implements the https://github.com/rowanwins/visibility-graph
    const polygons: LatLng[][] = (floor.areas.map((area) => {
        if (area.traversable) return undefined;
        if (area.shape instanceof Object) {
            const geoJsonShape = area.shape as unknown as GeoJSON.Feature;
            if (geoJsonShape.geometry.type === "Polygon") {
                // I think that each set of coordinates can hold multiple polygons but since we only ever store 1 polygon it is safe to index into [0]
                return geoJsonShape.geometry.coordinates[0]
            }
        }
    })
        .filter((point) => point !== undefined) as GeoJSON.Position[][])
        .map((posArr) => {
            return posArr.map((pos) => new LatLng(pos[1], pos[0]))
        })

    edges.push(...polygons.flatMap((polygon) => {
        return polygon.map((latLng, i) => new Edge(latLng, polygon[(i + 1) % polygon.length]))
    }))

    vertices.push(...polygons.flatMap((polygon) => {
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
            let doesNotCrossAnyEdges = edges.findIndex((edge) => intersects(navMesh[i].point, navMesh[otherVertexIndex].point, edge)) === -1;
            if (doesNotCrossAnyEdges) {
                navMesh[i].edges.push(new EdgeWithWeight(navMesh[otherVertexIndex], getDistanceBetweenGPSPoints(navMesh[i].point, navMesh[otherVertexIndex].point), otherVertexIndex))
            }
        }
    }

    return [navMesh, edges] as const
}

const addPointToNavMesh = (navMesh: NavMesh, edges: Edge[], start: LatLng) => {
    let newEdges: EdgeWithWeight[] = [];
    for (let otherVertexIndex = 0; otherVertexIndex < navMesh.length; otherVertexIndex++) {
        let doesNotCrossAnyEdges = edges.findIndex((edge) => intersects(start, navMesh[otherVertexIndex].point, edge)) === -1;
        if (doesNotCrossAnyEdges) {
            newEdges.push(new EdgeWithWeight(navMesh[otherVertexIndex], getDistanceBetweenGPSPoints(start, navMesh[otherVertexIndex].point), otherVertexIndex))

        }
    }
    navMesh.push({
        index: navMesh.length,
        point: start,
        edges: newEdges,
    })
    newEdges.forEach((edge) => {
        edge.otherVertex.edges.push(new EdgeWithWeight(navMesh[navMesh.length - 1], getDistanceBetweenGPSPoints(start, edge.otherVertex.point), navMesh.length - 1))
    })
}

export const extendNavMesh = (navMesh: NavMesh, edges: Edge[], start: LatLng, end: LatLng) => {
    addPointToNavMesh(navMesh, edges, start);
    addPointToNavMesh(navMesh, edges, end);
}

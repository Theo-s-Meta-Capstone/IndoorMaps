import { Prisma } from "@prisma/client";
import { doIntersect } from "./doIntersect.js";
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
    constructor(otherVertex: NavMeshVertex, weight: number) {
        this.otherVertex = otherVertex;
        this.weight = weight;
    }
}

export type NavMeshVertex = {
    point: LatLng
    edges: EdgeWithWeight[]
}

export type NavMesh = NavMeshVertex[]

export const generateNavMesh = (floor: FloorIncludeAreas): NavMesh => {
    const floorGeoJSON: GeoJSON.FeatureCollection = floor.shape as unknown as GeoJSON.FeatureCollection;
    // The floor contains may doors (which are type Marker) and 1 outline (which is type shape)
    const floorOutline = floorGeoJSON.features.find((feature) => feature.geometry.type === "Polygon");
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
            return posArr.map((pos) => new LatLng(pos[0], pos[1]))
        })

    const edges = polygons.flatMap((polygon) => {
        return polygon.map((latLng, i) => new Edge(latLng, polygon[i % polygon.length]))
    })

    const vertices = polygons.flatMap((polygon) => {
        return polygon.map((latLng) => latLng)
    })

    let navMesh: NavMesh = vertices.map((vertex): NavMeshVertex => {
        return {
            point: vertex,
            edges: [],
        }
    })

    for (let i = 0; i < navMesh.length; i++) {
        for (let otherVertexIndex = 0; otherVertexIndex < navMesh.length; otherVertexIndex++){
            let doesNotCrossAnyEdges = edges.findIndex((edge) => doIntersect(navMesh[i].point, navMesh[otherVertexIndex].point, edge)) === -1;
            if (!doesNotCrossAnyEdges) {
                navMesh[i].edges.push(new EdgeWithWeight(navMesh[otherVertexIndex], getDistanceBetweenGPSPoints(navMesh[i].point, navMesh[otherVertexIndex].point)))
            }
        }
    }

    return navMesh
}

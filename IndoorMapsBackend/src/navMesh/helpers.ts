import { LatLng } from "../graphqlSchemaTypes/Building.js"
import { Edge, NavMesh, NavMeshVertex, extendNavMesh } from "./GenerateNavMesh.js";
import { PriorityQueue } from "./PriorityQueue.js";

// based on https://en.wikipedia.org/wiki/Geographical_distance#Spherical_Earth_formulae
// TODO: this is currently the sheralc earth formula, update to the FCC formula to take into account a better aproximation of earth's shape
export const getDistanceBetweenGPSPoints = (p1: LatLng, p2: LatLng): number => {
    const deltaLat = p2.lat - p1.lat;
    const deltaLon = p2.lon - p1.lon;
    const avgLat = (p2.lat + p1.lat) / 2;
    return Math.sqrt(Math.pow(deltaLat, 2) + Math.pow(Math.cos(avgLat) * (deltaLon), 2))
}

const getClosestVertext = (navMesh: NavMesh, point: LatLng) => {
    let realStart = navMesh[0]
    let realStartDist = getDistanceBetweenGPSPoints(point, navMesh[0].point)
    let realStartIndex = -1;
    navMesh.forEach((vertex, i) => {
        const dist = getDistanceBetweenGPSPoints(point, vertex.point)
        if (realStartDist > dist) {
            realStart = vertex;
            realStartDist = dist;
            realStartIndex = i;
        }
    })
    return [realStart, realStartIndex] as const
}

// based on https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm#Using_a_priority_queue
const dijkstra = (navMesh: NavMesh, start: number, end: number): NavMeshVertex[] => {
    const minQueue = new PriorityQueue<number>([start]);
    const distance: { [key: number]: number } = {};
    distance[start] = 0;
    const previousNearestVertex: { [key: number]: number | undefined } = {};
    navMesh.forEach((vertex, i) => {
        if (i !== start) {
            distance[i] = Infinity;
            previousNearestVertex[i] = undefined;
        }
    })
    while (minQueue.size > 0) {
        let nextClosest = minQueue.poll()!;
        navMesh[nextClosest].edges.forEach((vertex) => {
            let alt = distance[nextClosest] + vertex.weight
            if (alt < distance[vertex.index]) {
                previousNearestVertex[vertex.index] = nextClosest
                distance[vertex.index] = alt
                minQueue.addWithPriority(vertex.index, alt)
            }
        })
    }
    let res: NavMeshVertex[] = [];
    let cur = end;
    while(previousNearestVertex[cur] !== undefined) {
        // It's weired that TS makes me do ! here, it should know that it can't be undefined
        res.push(navMesh[previousNearestVertex[cur]!]);
        cur = previousNearestVertex[cur]!;
    }
    return res.reverse();
}

export const findshortestPath = (navMesh: NavMesh, edges: Edge[], start: LatLng, end: LatLng): LatLng[] => {
    extendNavMesh(navMesh, edges, start, end);
    let res: LatLng[] = [];
    res.push(...dijkstra(navMesh, navMesh.length - 2, navMesh.length - 1).map((vertex) => vertex.point))
    res.push(end)
    return res;
}

export const findPolygonCenter = (polygon: GeoJSON.Feature): LatLng | undefined => {
    if (polygon.geometry.type != "Polygon") return;
    let res = new LatLng(0, 0);
    polygon.geometry.coordinates[0].forEach((position) => {
        res.lat += position[1];
        res.lon += position[0];
    })

    res.lat /= polygon.geometry.coordinates[0].length;
    res.lon /= polygon.geometry.coordinates[0].length;
    return res;
}

import { LatLng } from "../graphqlSchemaTypes/Building.js"
import { NavMesh, NavMeshVertex } from "./GenerateNavMesh.js";

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
    navMesh.forEach((vertex) => {
        const dist = getDistanceBetweenGPSPoints(point, vertex.point)
        if (realStartDist < dist) {
            realStart = vertex;
            realStartDist = dist;
        }
    })
    return realStart
}

const dijkstra = (start: NavMeshVertex, end: NavMeshVertex): NavMeshVertex[] => {
    return []
}

export const findshortestPath = (navMesh: NavMesh, start: LatLng, end: LatLng): LatLng[] => {
    let res = [start];
    let realStart = getClosestVertext(navMesh, start)
    res.push(realStart.point)
    let realEnd = getClosestVertext(navMesh, end)
    res.push(...dijkstra(realStart, realEnd).map((vertex) => vertex.point))
    res.push(realEnd.point)
    res.push(end)
    return res;
}

export const findPolygonCenter = (polygon: GeoJSON.Feature): LatLng | undefined => {
    if (polygon.geometry.type != "Polygon") return;
    let res = new LatLng(0, 0);
    polygon.geometry.coordinates[0].forEach((position) => {
        res.lat += position[0];
        res.lon += position[1];
    })

    res.lat /= polygon.geometry.coordinates[0].length;
    res.lon /= polygon.geometry.coordinates[0].length;
    return res;
}

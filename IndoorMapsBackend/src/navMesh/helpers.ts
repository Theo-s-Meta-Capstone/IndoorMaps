import { LatLng } from "../graphqlSchemaTypes/Building.js"
import { Wall } from "./GenerateNavMesh.js";

// based on https://en.wikipedia.org/wiki/Geographical_distance#Spherical_Earth_formulae
// TODO: this is currently the sheralc earth formula, update to the FCC formula to take into account a better aproximation of earth's shape
export const getDistanceBetweenGPSPoints = (p1: LatLng, p2: LatLng): number => {
    const deltaLat = p2.lat - p1.lat;
    const deltaLon = p2.lon - p1.lon;
    const avgLat = (p2.lat + p1.lat) / 2;
    return Math.sqrt(Math.pow(deltaLat, 2) + Math.pow(Math.cos(avgLat) * (deltaLon), 2))
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

export const areWallsEqual = (e1: Wall, e2: Wall) => {
    return e1.point1.lat === e2.point1.lat && e1.point1.lon === e2.point1.lon && e1.point2.lat === e2.point2.lat && e1.point2.lon === e2.point2.lon
}

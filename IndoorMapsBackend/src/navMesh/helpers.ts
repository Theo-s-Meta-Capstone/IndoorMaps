import { LatLng } from "../graphqlSchemaTypes/Building.js"

// based on https://en.wikipedia.org/wiki/Geographical_distance#Spherical_Earth_formulae
// TODO: this is currently the sheralc earth formula, update to the FCC formula to take into account a better aproximation of earth's shape
export const getDistanceBetweenGPSPoints = (p1: LatLng, p2: LatLng): number => {
    const deltaLat = p2.lat - p1.lat;
    const deltaLon = p2.lon - p1.lon;
    const avgLat = (p2.lat + p1.lat)/2;
    return Math.sqrt(Math.pow(deltaLat, 2) + Math.pow(Math.cos(avgLat)*(deltaLon), 2))
}

// This code is modified from https://www.geeksforgeeks.org/check-if-two-given-line-segments-intersect/
// I mostly only added typings

import { LatLng } from "../graphqlSchemaTypes/Building.js";
import { Wall } from "./GenerateNavMesh.js";

// Given three collinear LatLngs p, q, r, the function checks if
// LatLng q lies on line segment 'pr'
function onSegment(p: LatLng, q: LatLng, r: LatLng) {
    if (q.lat <= Math.max(p.lat, r.lat) && q.lat >= Math.min(p.lat, r.lat) &&
        q.lon <= Math.max(p.lon, r.lon) && q.lon >= Math.min(p.lon, r.lon))
        return true;

    return false;
}

// To find orientation of ordered triplet (p, q, r).
// The function returns following values
// 0 --> p, q and r are collinear
// 1 --> Clockwise
// 2 --> Counterclockwise
function getOrderedTripletOrientation(p: LatLng, q: LatLng, r: LatLng) {

    // See https://www.geeksforgeeks.org/orientation-3-ordered-LatLngs/
    // for details of below formula.
    const val = (q.lon - p.lon) * (r.lat - q.lat) -
        (q.lat - p.lat) * (r.lon - q.lon);

    if (val == 0) return 0; // collinear

    return (val > 0) ? 1 : 2; // clock or counterclock wise
}

// The main function that returns true if line segment 'p1q1'
// and 'p2q2' intersect.
export function doIntersect(p1: LatLng, q1: LatLng, wall: Wall): boolean {

    const p2 = wall.point1;
    const q2 = wall.point2;

    // Find the four orientations needed for general and
    // special cases
    const o1 = getOrderedTripletOrientation(p1, q1, p2);
    const o2 = getOrderedTripletOrientation(p1, q1, q2);
    const o3 = getOrderedTripletOrientation(p2, q2, p1);
    const o4 = getOrderedTripletOrientation(p2, q2, q1);

    // General case
    if (o1 != o2 && o3 != o4)
        return true;

    // Special Cases
    // p1, q1 and p2 are collinear and p2 lies on segment p1q1
    if (o1 == 0 && onSegment(p1, p2, q1)) return true;

    // p1, q1 and q2 are collinear and q2 lies on segment p1q1
    if (o2 == 0 && onSegment(p1, q2, q1)) return true;

    // p2, q2 and p1 are collinear and p1 lies on segment p2q2
    if (o3 == 0 && onSegment(p2, p1, q2)) return true;

    // p2, q2 and q1 are collinear and q1 lies on segment p2q2
    if (o4 == 0 && onSegment(p2, q1, q2)) return true;

    return false; // Doesn't fall in any of the above cases
}

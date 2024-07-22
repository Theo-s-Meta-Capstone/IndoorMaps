import { LatLng } from "../graphqlSchemaTypes/Building.js"
import { Wall } from "./GenerateNavMesh.js";
import { Voronoi } from "./voronoiDiagram.js";

// based on FCC formula for short distances (<475 kilometres) https://en.wikipedia.org/wiki/Geographical_distance#FCC's_formula
export const getDistanceBetweenGPSPoints = (p1: LatLng, p2: LatLng): number => {
    const deltaLat = p2.lat - p1.lat;
    const deltaLon = p2.lon - p1.lon;
    const avgLat = (p2.lat + p1.lat) / 2;
    // K1 and K2 are derived from radii of curvature of Earth (https://en.wikipedia.org/wiki/Geographical_distance#FCC's_formula)
    const K1 = 111.13209 - 0.56605 * Math.cos(2 * avgLat) + 0.00129 * Math.cos(4 * avgLat)
    const K2 = 111.41513 * Math.cos(avgLat) - 0.09455 * Math.cos(3 * avgLat) + 0.00012 * Math.cos(5 * avgLat)
    return Math.sqrt(Math.pow(K1 * deltaLat, 2) + Math.pow(K2 * deltaLon, 2))
}

//TOTO: fix to make work with irregular shapes
export const findPolygonCenter = (polygon: GeoJSON.Feature): LatLng | undefined => {
    if (polygon.geometry.type != "Polygon") return;
    const res = new LatLng(0, 0);
    polygon.geometry.coordinates[0].forEach((position) => {
        res.lat += position[1];
        res.lon += position[0];
    })

    res.lat /= polygon.geometry.coordinates[0].length;
    res.lon /= polygon.geometry.coordinates[0].length;
    return res;
}

// Compares two walls deeply by value
export const areWallsEqual = (e1: Wall, e2: Wall) => {
    return e1.point1.lat === e2.point1.lat && e1.point1.lon === e2.point1.lon && e1.point2.lat === e2.point2.lat && e1.point2.lon === e2.point2.lon
}

// Modified from https://www.npmjs.com/package/point-in-polygon?activeTab=readme
/**
 * detrimines whether a point is inside a polygon, used to find the room that needs to have it's walls not considered when adding an arbitray point (usually based on gps) to the nav mesh
 * @param point the point to check
 * @param vs the array of points that make up the polygon
 * @returns true if the point is inside the polygon, false otherwise
 */
export const pointInPolygon = (point: LatLng, vs: number[][]): boolean => {
    const x = point.lat, y = point.lon;
    let inside = false;
    const start = 0;
    const end = vs.length;
    const len = end - start;
    for (let i = 0, j = len - 1; i < len; j = i++) {
        const xi = vs[i + start][1], yi = vs[i + start][0];
        const xj = vs[j + start][1], yj = vs[j + start][0];
        const intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
};

// Intentially does not return the first or last point on the line
const getPointsAlongLine = (point1: LatLng, point2: LatLng, numberOfPoints: number): LatLng[] => {
    const res: LatLng[] = []
    numberOfPoints++;
    for(let i = 1; i < numberOfPoints; i++){
        res.push(new LatLng(
            point1.lat + (point2.lat - point1.lat) * i/numberOfPoints,
            point1.lon + (point2.lon - point1.lon) * i/numberOfPoints
        ))
    }
    return res;
}

/**
 *
 * @param point the point to check
 * @param bbox the bounding box of the rectange to check
 * @returns true if the point is inside the bounding box, false otherwise
 */
const isIn = (point: LatLng, bbox: { xl: number, xr: number, yt: number, yb: number }): boolean => {
    return point.lat >= bbox.xl && point.lat <= bbox.xr && point.lon >= bbox.yt && point.lon <= bbox.yb
}

const numberOfPointsToIncludeFromEachVoronoiEdge = 1;
/**
 * Takes a set of vertices and returns voronoi points to build a nav mesh with
 * @param vertices the vertices of the existing polygons to find the voronoi points
 * @returns the voronoi points, to be used to create the nav mesh
 */
export const vorornoiDriver = (vertices: LatLng[]): LatLng[] => {
    // js constructor hack from https://stackoverflow.com/a/51622913
    const voronoi = new (Voronoi as any);
    const bbox = {
        xl: Math.min(...vertices.map(vertex => vertex.lat)),
        xr: Math.max(...vertices.map(vertex => vertex.lat)),
        yt: Math.min(...vertices.map(vertex => vertex.lon)),
        yb: Math.max(...vertices.map(vertex => vertex.lon))
    }; // xl is x-left, xr is x-right, yt is y-top, and yb is y-bottom
    const sites = vertices.map(vertex => { return { "x": vertex.lat, "y": vertex.lon } });
    const diagram = voronoi.compute(sites, bbox);
    return diagram.edges.flatMap((edge: { va: { "x": number, "y": number }, vb: { "x": number, "y": number } }) => {
        return getPointsAlongLine(new LatLng(edge.va.x, edge.va.y), new LatLng(edge.vb.x, edge.vb.y), numberOfPointsToIncludeFromEachVoronoiEdge)
    }).concat(diagram.vertices.map((vertex: { "x": number, "y": number }) => {
        return new LatLng(vertex.x, vertex.y)
    })).filter((vertex: LatLng) => isIn(vertex, bbox))
}

import { LatLng } from "../graphqlSchemaTypes/Building";
import { NavMesh } from "./GenerateNavMesh.js";
import { PriorityQueue } from "./PriorityQueue.js";

// based on https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm#Using_a_priority_queue
/**
 * Dijkstra's algorithm to find the shortest path from fromIndex to toIndex in navMesh.
 * @param navMesh the entire graph to be searched
 * @param fromIndex the index of the vertex to start from in the navMesh
 * @param toIndex the index of the vertex to end at in the navMesh
 * @returns [an Array of NavMeshVertex that represent the shortest path from fromIndex to toIndex, the distance between fromIndex and toIndex in km]
 */
const dijkstra = (navMesh: NavMesh, fromIndex: number, toIndex: number): [LatLng[], number] => {
    const minQueue = new PriorityQueue<number>([fromIndex]);
    const distance: { [key: number]: number } = {};
    for (let i = 0, n = navMesh.length; i < n; i++) {
        distance[i] = Infinity;
    }
    distance[fromIndex] = 0;
    const previousNearestVertex: { [key: number]: number | undefined } = {};
    while (minQueue.size > 0) {
        const nextClosest = minQueue.poll()!;
        for (const vertex of navMesh[nextClosest].edges) {
            const alt = distance[nextClosest] + vertex.weight
            if (alt < distance[vertex.index]) {
                previousNearestVertex[vertex.index] = nextClosest
                distance[vertex.index] = alt
                minQueue.addWithPriority(vertex.index, alt)
            }
        }
    }
    const res: LatLng[] = [];
    let cur = toIndex;
    while (previousNearestVertex[cur] !== undefined) {
        // It's weired that TS makes me do ! here, it should know that it can't be undefined
        res.push(navMesh[previousNearestVertex[cur]!].point);
        cur = previousNearestVertex[cur]!;
    }
    return [res.reverse(), distance[toIndex]];
}

/**
 * Find the shortest path from fromIndex to toIndex in navMesh. Essentially a driver for dijkstra()
 * @param navMesh the entire graph to be searched
 * @param fromIndex the index of the vertex to start from in the navMesh
 * @param toIndex the index of the vertex to end at in the navMesh
 * @returns an array of latlng that can be desplayed as a line to show the path from fromIndex to toIndex, the distance between fromIndex and toIndex in km
 */
export const findShortestPath = (navMesh: NavMesh, fromIndex: number, toIndex: number): [LatLng[], number] => {
    const [path, distance] = dijkstra(navMesh, fromIndex, toIndex)
    if (path.length === 0) return [[], -1]
    const res = path
    res.push(navMesh[toIndex].point)
    return [res, distance];
}

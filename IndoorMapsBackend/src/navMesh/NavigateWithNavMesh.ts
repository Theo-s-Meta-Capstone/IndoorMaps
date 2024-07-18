import { LatLng } from "../graphqlSchemaTypes/Building";
import { Wall, NavMesh, NavMeshVertex, extendNavMesh } from "./GenerateNavMesh.js";
import { PriorityQueue } from "./PriorityQueue.js";

// based on https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm#Using_a_priority_queue
const dijkstra = (navMesh: NavMesh, start: number, end: number): [NavMeshVertex[], number] => {
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
    return [res.reverse(), distance[end]];
}

export const findShortestPath = (navMesh: NavMesh, startIndex: number, endIndex: number): [LatLng[], number] => {
    let res: LatLng[] = [];
    const [path, distance] = dijkstra(navMesh, startIndex, endIndex)
    if(path.length === 0) return [[], -1]
    res.push(...path.map((vertex) => vertex.point))
    res.push(navMesh[endIndex].point)
    return [res, distance];
}

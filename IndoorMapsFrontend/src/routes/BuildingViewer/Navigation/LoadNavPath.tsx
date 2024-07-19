import * as L from "leaflet";
import { useEffect } from "react"
import { AreaToAreaRouteInfo } from "../../../utils/types";
import { removeAllLayersFromLayerGroup } from "../../../utils/utils";


// THIS IS REPEATED CODE, should find a way to import driectly from the backend (BEST solution is to add to the graphql shema)
export class LatLng {
  constructor(lat: number, lon: number) {
    this.lat = lat;
    this.lon = lon
  }
  lat: number

  lon: number
}
export class Wall {
    point1: LatLng
    point2: LatLng
    constructor(point1: LatLng, point2: LatLng) {
        this.point1 = point1;
        this.point2 = point2
    }
}

type Props = {
    map: L.Map;
    areaToAreaRouteInfo: AreaToAreaRouteInfo;
}

const pathLayerGroup = new L.LayerGroup();

const LoadNavPath = ({ map, areaToAreaRouteInfo }: Props) => {

    useEffect(() => {
        if (!areaToAreaRouteInfo.path) return;
        removeAllLayersFromLayerGroup(pathLayerGroup, map)

        if (areaToAreaRouteInfo.options && areaToAreaRouteInfo.options.showWalls && areaToAreaRouteInfo.walls) {
            const walls = JSON.parse(areaToAreaRouteInfo.walls)
            walls.forEach((wall: Wall) => {
                const polyLine = new L.Polyline([[wall.point1.lat, wall.point1.lon], [wall.point2.lat, wall.point2.lon]], {color: "red"})
                polyLine.addTo(pathLayerGroup);
            })
        }

        // These are Edges, but I (@theohal) stored them as walls so that I could use the same code to display them
        if (areaToAreaRouteInfo.options && areaToAreaRouteInfo.options.showEdges && areaToAreaRouteInfo.navMesh) {
            const edges = JSON.parse(areaToAreaRouteInfo.navMesh)
            edges.forEach((edge: Wall) => {
                const polyLine = new L.Polyline([[edge.point1.lat, edge.point1.lon], [edge.point2.lat, edge.point2.lon]], {color: "green", weight: 1})
                polyLine.addTo(pathLayerGroup);
            })
        }

        const polyLine = new L.Polyline(areaToAreaRouteInfo.path)
        polyLine.addTo(pathLayerGroup);

    }, [areaToAreaRouteInfo.path, areaToAreaRouteInfo.options?.showEdges, areaToAreaRouteInfo.options?.showWalls, areaToAreaRouteInfo.options?.showInfo])

    useEffect(() => {
        pathLayerGroup.addTo(map)
    }, [])

    return (<></>)
}

export default LoadNavPath;

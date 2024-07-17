import * as L from "leaflet";
import { useEffect } from "react"
import { AreaToAreaRouteInfo } from "../../../../utils/types";
import { removeAllLayersFromLayerGroup } from "../../../../utils/utils";


// THIS IS REPEATED CODE, should find a way to import driectly from the backend (BEST solution is to add to the graphql shema)
export class LatLng {
  constructor(lat: number, lon: number) {
    this.lat = lat;
    this.lon = lon
  }
  lat: number

  lon: number
}
export class Edge {
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

        if (areaToAreaRouteInfo.edges) {
            let edges = JSON.parse(areaToAreaRouteInfo.edges)
            edges.forEach((edge: Edge) => {
                let polyLine = new L.Polyline([[edge.point1.lat, edge.point1.lon], [edge.point2.lat, edge.point2.lon]], {color: "red"})
                polyLine.addTo(pathLayerGroup);
            })
        }

        if (areaToAreaRouteInfo.navMesh) {
            let edges = JSON.parse(areaToAreaRouteInfo.navMesh)
            edges.forEach((edge: Edge) => {
                let polyLine = new L.Polyline([[edge.point1.lat, edge.point1.lon], [edge.point2.lat, edge.point2.lon]], {color: "green", weight: 1})
                polyLine.addTo(pathLayerGroup);
            })
        }

        let polyLine = new L.Polyline(areaToAreaRouteInfo.path)
        polyLine.addTo(pathLayerGroup);

    }, [areaToAreaRouteInfo.path])

    useEffect(() => {
        pathLayerGroup.addTo(map)
    }, [])

    return (<></>)
}

export default LoadNavPath;

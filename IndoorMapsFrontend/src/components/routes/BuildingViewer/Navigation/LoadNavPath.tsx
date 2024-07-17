import * as L from "leaflet";
import { useEffect } from "react"
import { AreaToAreaRouteInfo } from "../../../../utils/types";
import { removeAllLayersFromLayerGroup } from "../../../../utils/utils";

type Props = {
    map: L.Map;
    areaToAreaRouteInfo: AreaToAreaRouteInfo;

}

const pathLayerGroup = new L.LayerGroup();

const LoadNavPath = ({ map, areaToAreaRouteInfo }: Props) => {

    useEffect(() => {
        if(!areaToAreaRouteInfo.path) return;
        removeAllLayersFromLayerGroup(pathLayerGroup, map)
        let polyLine = new L.Polyline(areaToAreaRouteInfo.path)
        polyLine.addTo(pathLayerGroup);
    }, [areaToAreaRouteInfo.path])

    useEffect(() => {
        pathLayerGroup.addTo(map)
    }, [])

    return (<></>)
}

export default LoadNavPath;

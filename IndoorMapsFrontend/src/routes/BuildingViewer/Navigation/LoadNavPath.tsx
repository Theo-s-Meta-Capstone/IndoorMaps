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

const cleanAnimatedNavMarkersFromDom = (numberToLeaveInDom: number = 1) => {
    const markersToCleanFromDom = document.getElementsByClassName("navAnimatedMarker");
    for (let i = 0; i < markersToCleanFromDom.length - numberToLeaveInDom; i++) {
        markersToCleanFromDom[i].remove();
    }
}

const LoadNavPath = ({ map, areaToAreaRouteInfo }: Props) => {

    useEffect(() => {
        removeAllLayersFromLayerGroup(pathLayerGroup, map)
        if (!areaToAreaRouteInfo.path) {
            cleanAnimatedNavMarkersFromDom(0)
            return;
        }

        if (areaToAreaRouteInfo.options && areaToAreaRouteInfo.options.showWalls && areaToAreaRouteInfo.walls) {
            const walls = JSON.parse(areaToAreaRouteInfo.walls)
            walls.forEach((wall: Wall) => {
                const polyLine = new L.Polyline([[wall.point1.lat, wall.point1.lon], [wall.point2.lat, wall.point2.lon]], { color: "red" })
                polyLine.addTo(pathLayerGroup);
            })
        }
        // These are Edges, but I (@theohal) stored them as walls so that I could use the same code to display them
        if (areaToAreaRouteInfo.options && areaToAreaRouteInfo.options.showEdges && areaToAreaRouteInfo.navMesh) {
            const edges = JSON.parse(areaToAreaRouteInfo.navMesh)
            edges.forEach((edge: Wall) => {
                const polyLine = new L.Polyline([[edge.point1.lat, edge.point1.lon], [edge.point2.lat, edge.point2.lon]], { color: "green", weight: 1 })
                polyLine.addTo(pathLayerGroup);
            })
        }

        if (areaToAreaRouteInfo.path.length === 0) {
            cleanAnimatedNavMarkersFromDom(0);
            return;
        }
        const polyLine = new L.Polyline(areaToAreaRouteInfo.path)
        polyLine.addTo(pathLayerGroup);
        const element = polyLine.getElement()
        if (element) {
            element.id = "navPath"
            // if this path had an id it would replace itself in the dom tree but that causes a little bit of stutter,
            // But if the same element is used repeatedly then it will appear behind the path after the first path
            // so we create a new element each time (polluting the dom)
            element.insertAdjacentHTML('afterend', `
                <path class="highMotionAnimation navAnimatedMarker" d="M19.4254 8.08731C19.589 8.16254 19.7292 8.28052 19.8312 8.42881C19.9333 8.57709 19.9934 8.75017 20.0053 8.92979C20.0172 9.10941 19.9804 9.28891 19.8987 9.44934C19.8171 9.60977 19.6936 9.74519 19.5414 9.84131L19.4254 9.90331L2.06045 17.9083C1.49445 18.1063 0.864443 17.9583 0.445443 17.5303C0.259255 17.3419 0.125158 17.1084 0.0562699 16.8527C-0.0126182 16.597 -0.0139372 16.3277 0.0524438 16.0713L2.45044 8.99431L0.112446 2.09531C0.0139042 1.84401 -0.0166288 1.57117 0.0239276 1.3043C0.0644841 1.03744 0.174695 0.785984 0.343445 0.575306L0.443445 0.463306C0.829445 0.0653059 1.39744 -0.0926939 1.99944 0.0703061L2.14944 0.117306L19.4254 8.08731Z"
                    fill="skyblue" stroke="black" transform="translate(0,-8)">
                    <animateMotion dur="3s" repeatCount="indefinite" rotate="auto" >
                        <mpath href="#navPath" />
                    </animateMotion>
                </path>
            `);

            // Here the old animated nav markers are removed
            setTimeout(cleanAnimatedNavMarkersFromDom, 300);
        }
    }, [areaToAreaRouteInfo.path, areaToAreaRouteInfo.options?.showEdges, areaToAreaRouteInfo.options?.showWalls, areaToAreaRouteInfo.options?.showInfo])

    useEffect(() => {
        pathLayerGroup.addTo(map)
    }, [])

    return (<></>)
}

export default LoadNavPath;

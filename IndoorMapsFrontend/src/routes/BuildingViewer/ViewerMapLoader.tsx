import { useEffect, useRef, useState } from "react";
import { getAreaOfPolygon, removeAllLayersFromLayerGroup } from "../../utils/utils";
import { DoorMarkerIcon, IndoorDoorMarkerIcon } from "../../utils/markerIcon";
import * as L from "leaflet";
import { graphql, useFragment } from "react-relay";
import { ViewerMapLoaderFragment$key } from "./__generated__/ViewerMapLoaderFragment.graphql";
import { Button, Group } from "@mantine/core";
import { AreaToAreaRouteInfo } from "../../utils/types";
import LoadNavPath from "./Navigation/LoadNavPath";
import DispalyLiveMarkers from "./DisplayLiveMarkers";

const ViewerMapFragment = graphql`
  fragment ViewerMapLoaderFragment on Building
  {
    id
    databaseId
    floors {
      id
      databaseId
      title
      description
      shape
      areas {
        id
        databaseId
        title
        description
        shape
        entrances
      }
    }
  }
`;


type Props = {
    map: L.Map;
    buildingFromParent: ViewerMapLoaderFragment$key;
    areaToAreaRouteInfo: AreaToAreaRouteInfo;
    setAreaToAreaRouteInfo: (newdata: AreaToAreaRouteInfo) => void,
    children: React.ReactNode;
}

const floorMapLayer = L.geoJSON(null, {
    pointToLayer: function (_feature, latlng) {
        return L.marker(latlng, { icon: DoorMarkerIcon });
    }
});
const areasMapLayer = L.geoJSON(null, {
    pointToLayer: function (_feature, latlng) {
        return L.marker(latlng, { icon: IndoorDoorMarkerIcon });
    }
});

const getWhichZoomToShowToolTipAt = (size: number, textLength: number) => {
    // Formula found by messing around with values and some linear regression in desmos, /2 becuase the zoom can be .0 or .5
    // note, an increase in size and/or textLenght causes the result to decrease
    const x = size * (textLength / 2)
    return Math.floor((16.1816 * x * x + -25.0545 * x + 21) * 2) / 2
}

const ViewerMapLoader = ({ map, buildingFromParent, areaToAreaRouteInfo, setAreaToAreaRouteInfo, children }: Props) => {
    const building = useFragment(ViewerMapFragment, buildingFromParent);
    // Used to ensure the map is only set up once
    const [mapIsSetUp, setMapIsSetUp] = useState(false);
    const [currentFloor, setCurrentFloor] = useState<number | null>(null);
    const areaToAreaRouteInfoRef = useRef(areaToAreaRouteInfo);

    useEffect(() => {
        areaToAreaRouteInfoRef.current = areaToAreaRouteInfo;
    }, [areaToAreaRouteInfo])

    const getLayerFromRefOrId = (layer: L.Polygon | number): L.Polygon | undefined => {
        return layer instanceof L.Polygon ?
            layer
            :
            // using Filter instead of find so that all layers are processed and received the change to their original fill color
            areasMapLayer.getLayers().find((foundLayer) => {
                return foundLayer instanceof L.Polygon && foundLayer.feature && foundLayer.feature.properties.databaseId == layer
                // only finds layers that are an instance of L.Polygon so it is safe to use typescript as
            }) as (L.Polygon | undefined)
    }

    const updateAreaColors = () => {
        areasMapLayer.getLayers().forEach((foundLayer) => {
            if (foundLayer instanceof L.Polygon && foundLayer.feature) {
                if (areaToAreaRouteInfo.from && !areaToAreaRouteInfo.from.isLatLon && foundLayer.feature.properties.databaseId === areaToAreaRouteInfo.from.areaDatabaseId) {
                    foundLayer.setStyle({
                        fillColor: 'lightgreen',
                    });
                }
                else if (areaToAreaRouteInfo.to && !areaToAreaRouteInfo.to.isLatLon && foundLayer.feature.properties.databaseId == areaToAreaRouteInfo.to.areaDatabaseId) {
                    foundLayer.setStyle({
                        fillColor: 'lightblue',
                    });
                }
                else {
                    foundLayer.setStyle({
                        fillColor: 'white',
                    });
                }
            }
        })
    }

    const flyToArea = (layer: L.Polygon | number) => {
        const layerToFlyTo: L.Polygon | undefined = getLayerFromRefOrId(layer);
        if (!layerToFlyTo) return;
        if (layerToFlyTo.feature) {
            const size = getAreaOfPolygon(layerToFlyTo);
            map.flyTo(
                layerToFlyTo.getCenter(),
                Math.max(getWhichZoomToShowToolTipAt(size, layerToFlyTo.feature.properties.title.length), map.getZoom()),
                {animate: true}
            );
        }
    }

    const updateDisplayedTags = () => {
        const zoomLevel = map.getZoom();
        const toolTips = document.getElementsByClassName("title") as HTMLCollectionOf<HTMLElement>;
        for (let i = 0; i < toolTips.length; i++) {
            const zoomLevelToShow = toolTips[i].classList.toString().split("showAtZoom")[1];
            if (parseInt(zoomLevelToShow) > zoomLevel) {
                toolTips[i].style.opacity = "0";
            }
            else {
                toolTips[i].style.opacity = "1";
            }
        }
    }

    const setUpMapBuilder = () => {
        if (mapIsSetUp) return;
        setMapIsSetUp(true)
        areasMapLayer.addTo(map)
        floorMapLayer.addTo(map)
    }

    const updateToArea = (newToData: { areaDatabaseId: number; currentFloor: number; title: string; description: string; }) => {
        const { areaDatabaseId, currentFloor, title, description } = newToData;
        // My theory is that the areaToAreaRouteInfo needs to be a Ref here becuase it is called inside of an event listener
        // In AreaNavigate.tsx I don't need to use a ref to get the current values. TODO: investigate further
        setAreaToAreaRouteInfo({
            ...areaToAreaRouteInfoRef.current,
            to: {
                isLatLon: false,
                areaDatabaseId,
                floorDatabaseId: currentFloor,
                title,
                description,
            }
        })
    }

    useEffect(() => {
        setUpMapBuilder();
    }, [map]);

    useEffect(() => {
        if (currentFloor == null && building.floors.length !== 0) {
            setCurrentFloor(building.floors[0].databaseId)
        }
        if (currentFloor === null) {
            return;
        }

        removeAllLayersFromLayerGroup(floorMapLayer, map);
        removeAllLayersFromLayerGroup(areasMapLayer, map);

        const currentFloorRef = building.floors.find(floor => floor.databaseId === currentFloor);
        if (!currentFloorRef) {
            throw new Error("No floor matching the current floor found")
        }

        if (currentFloorRef.shape) {
            const geoJson: GeoJSON.FeatureCollection = JSON.parse(currentFloorRef.shape);
            // add the geoJson to the floor and add the proper event listeners
            floorMapLayer.addData(geoJson);
        }

        floorMapLayer.getLayers().map((layer) => {
            if (layer instanceof L.Polygon) {
                layer.setStyle({
                    color: 'black',
                    fill: true,
                    fillOpacity: .3,
                    fillColor: 'tan',
                });
            }
        })

        currentFloorRef.areas.forEach((area) => {
            const geoJson: GeoJSON.Feature = JSON.parse(area.shape);
            // inject my data into the geojson properties
            geoJson.properties!.databaseId = area.databaseId
            geoJson.properties!.title = area.title
            geoJson.properties!.description = area.description
            areasMapLayer.addData(geoJson);
            if (area.entrances) {
                const doorGeoJson: GeoJSON.Feature = JSON.parse(area.entrances);
                areasMapLayer.addData(doorGeoJson);
            }
        })

        areasMapLayer.getLayers().map((layer) => {
            if (layer instanceof L.Polygon) {
                // The class lists property on set style doesn't work if the layer group has already been added to the map
                // Likly related to this old issue: https://github.com/leaflet/leaflet/issues/2662
                layer.setStyle({
                    color: 'black',
                    fill: true,
                    fillOpacity: 1,
                    fillColor: 'white',
                });
                // getElement relys on the layer being already added to the map,
                layer.getElement()?.classList.add("area")
                if (layer.feature) {
                    const size = getAreaOfPolygon(layer);
                    if (areaToAreaRouteInfo.to && !areaToAreaRouteInfo.to.isLatLon && layer.feature.properties.databaseId == areaToAreaRouteInfo.to.areaDatabaseId) {
                        flyToArea(layer);
                    }
                    if (layer.feature.properties.title) {
                        layer.bindTooltip(layer.feature.properties.title, { offset: [0, 5], direction: "top", permanent: true, className: "title showAtZoom" + getWhichZoomToShowToolTipAt(size, layer.feature.properties.title.length) + "showAtZoom" });
                        const areaDatabaseId = layer.feature.properties.databaseId;
                        const title = layer.feature.properties.title;
                        const description = layer.feature.properties.description;
                        layer.on("click", () => updateToArea({ areaDatabaseId, currentFloor, title, description }))
                    }
                }
            }
            updateAreaColors();
        })

        updateDisplayedTags()
        map.on("zoomend", updateDisplayedTags);

    }, [currentFloor])

    useEffect(() => {
        updateAreaColors();
    }, [areaToAreaRouteInfo.from])

    useEffect(() => {
        if (areaToAreaRouteInfo.to && !areaToAreaRouteInfo.to.isLatLon) {
            if (areaToAreaRouteInfo.to.floorDatabaseId != currentFloor) {
                setCurrentFloor(areaToAreaRouteInfo.to.floorDatabaseId)
            } else {
                flyToArea(areaToAreaRouteInfo.to.areaDatabaseId);
            }
        }
        updateAreaColors();
    }, [areaToAreaRouteInfo.to])

    const floorListElements = building.floors.map((floor) => {
        return (
            <Button
                color={(currentFloor === floor.databaseId) ? "red" : "blue"}
                onClick={() => setCurrentFloor(floor.databaseId)}
                key={floor.id}>
                {floor.title}
            </Button>
        )
    });

    return (
        <Group className="floorsContainer" >
            <LoadNavPath areaToAreaRouteInfo={areaToAreaRouteInfo} map={map} />
            {floorListElements}
            <DispalyLiveMarkers setAreaToAreaRouteInfo={setAreaToAreaRouteInfo} areaToAreaRouteInfo={areaToAreaRouteInfo} map={map} floorDatabaseId={currentFloor} />
            {children}
        </Group>
    )
}

export default ViewerMapLoader;
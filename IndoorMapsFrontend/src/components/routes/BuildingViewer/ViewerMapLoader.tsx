import { useEffect, useState } from "react";
import { removeAllLayersFromLayerGroup } from "../../../utils/utils";
import { DoorMarkerIcon, IndoorDoorMarkerIcon } from "../../../utils/markerIcon";
import * as L from "leaflet";
import { graphql, useFragment } from "react-relay";
import { ViewerMapLoaderFragment$key } from "./__generated__/ViewerMapLoaderFragment.graphql";
import { Button, Group } from "@mantine/core";

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

const ViewerMapLoader = ({ map, buildingFromParent, children }: Props) => {
    const building = useFragment(ViewerMapFragment, buildingFromParent);
    // Used to ensure the map is only set up once
    const [mapIsSetUp, setMapIsSetUp] = useState(false);
    const [currentFloor, setCurrentFloor] = useState<number | null>(null);

    const setUpMapBuilder = () => {
        if (mapIsSetUp) return;
        setMapIsSetUp(true)
        areasMapLayer.addTo(map)
        floorMapLayer.addTo(map)
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
                if (layer.feature) {
                    if (layer.feature.properties.title) {
                        layer.bindTooltip(layer.feature.properties.title, { permanent: true, className: "title", offset: [0, 0] });
                    }
                    if (layer.feature.properties.description) {
                        layer.bindPopup(layer.feature.properties.description, { className: "description", offset: [0, 0] });
                    }
                }
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
            }
        })

    }, [currentFloor])

    const floorListElements = building.floors.map((floor) => (<Button onClick={() => setCurrentFloor(floor.databaseId)} key={floor.id}>{floor.title}</Button>));


    return (
        <Group className="floorsContainer" >
            {floorListElements}
            {children}
        </Group>
    )
}

export default ViewerMapLoader;

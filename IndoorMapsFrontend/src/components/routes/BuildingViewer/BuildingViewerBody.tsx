import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from 'react-leaflet'
import { graphql, useFragment } from "react-relay";
import { BuildingViewerBodyFragment$key } from "./__generated__/BuildingViewerBodyFragment.graphql";
import { useEffect, useState } from "react";
import { Button, Group } from "@mantine/core";
import { DoorMarkerIcon } from "../../../utils/markerIcon";

const BuildingViewerFragment = graphql`
  fragment BuildingViewerBodyFragment on Building
  {
    id
    databaseId
    title
    startPos {
      lat
      lon
    }
    address
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
      }
    }
  }
`;

interface Props {
    buildingFromParent: BuildingViewerBodyFragment$key;
}

const floorMapLayer = L.geoJSON(null, {
    pointToLayer: function (_feature, latlng) {
        return L.marker(latlng, { icon: DoorMarkerIcon });
    }
});
const areasMapLayer = L.geoJSON();

const BuildingViewerBody = ({ buildingFromParent }: Props) => {
    const building = useFragment(BuildingViewerFragment, buildingFromParent);
    const startingPosition = L.latLng(building.startPos.lat, building.startPos.lon);
    const mapStyle = { height: '70vh', width: '100%', padding: 0, zIndex: 50 };
    const [currentFloor, setCurrentFloor] = useState<number | null>(null);


    // Used to ensure the map is only set up once
    const [mapIsSetUp, setMapIsSetUp] = useState(false);

    const [map, setMap] = useState<L.Map | null>(null);

    const setUpMapBuilder = () => {
        if (!map || mapIsSetUp) return;
        setMapIsSetUp(true)
    }

    useEffect(() => {
        setUpMapBuilder();
    }, [map]);

    useEffect(() => {
        if (currentFloor == null && building.floors.length !== 0) {
            setCurrentFloor(building.floors[0].databaseId)
        }
        if (currentFloor === null || !map) {
            return;
        }

        // remove all layers that are in the Layer group
        floorMapLayer.getLayers().map((layer) => {
            map.removeLayer(layer);
            floorMapLayer.removeLayer(layer);
        })

        areasMapLayer.getLayers().map((layer) => {
            map.removeLayer(layer);
            areasMapLayer.removeLayer(layer);
        })

        const currentFloorRef = building.floors.find(floor => floor.databaseId === currentFloor);
        if (!currentFloorRef) {
            throw new Error("No floor matching the current floor found")
        }

        if (currentFloorRef.shape) {
            const geoJson: GeoJSON.FeatureCollection = JSON.parse(currentFloorRef.shape);
            // add the geoJson to the floor and add the proper event listeners
            floorMapLayer.addData(geoJson);
            floorMapLayer.addTo(map);;
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
        })

        areasMapLayer.getLayers().map((layer) => {
            if (layer instanceof L.Polygon) {
                if (layer.feature) {
                    layer.bindTooltip(layer.feature.properties.title, { permanent: true, className: "title", offset: [0, 0] });
                }
                layer.setStyle({
                    color: 'black',
                    fill: true,
                    fillOpacity: 1,
                    fillColor: 'white',

                });
            }
        })

        areasMapLayer.addTo(map)
    }, [currentFloor])

    const floorListElements = building.floors.map((floor) => (<Button onClick={() => setCurrentFloor(floor.databaseId)} key={floor.id}>{floor.title}</Button>));

    return (
        <main className="ViewerMain">
            <Group className="floorsContainer" >
                {floorListElements}
            </Group>
            <MapContainer
                center={startingPosition}
                zoom={19}
                zoomSnap={0.5}
                zoomControl={false}
                style={mapStyle}
                ref={setMap}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxNativeZoom={18}
                    maxZoom={27}
                />
            </MapContainer>
        </main>
    )
}

export default BuildingViewerBody;

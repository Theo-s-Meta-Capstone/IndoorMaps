import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from 'react-leaflet'
import { graphql, useFragment } from "react-relay";
import { BuildingViewerBodyFragment$key } from "./__generated__/BuildingViewerBodyFragment.graphql";
import { useEffect, useState } from "react";
import { Button, Group } from "@mantine/core";
import { DoorMarkerIcon, IndoorDoorMarkerIcon, locationMarkerIcon } from "../../../utils/markerIcon";
import { useUserLocation } from "../../../utils/hooks";
import FormErrorNotification from "../../forms/FormErrorNotification";
import { removeAllLayersFromLayerGroup } from "../../../utils/utils";

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
        entrances
      }
    }
  }
`;

type Props = {
    buildingFromParent: BuildingViewerBodyFragment$key;
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

const BuildingViewerBody = ({ buildingFromParent }: Props) => {
    const building = useFragment(BuildingViewerFragment, buildingFromParent);
    const startingPosition = L.latLng(building.startPos.lat, building.startPos.lon);
    const mapStyle = { height: '70vh', width: '100%', padding: 0, zIndex: 50 };
    const [currentFloor, setCurrentFloor] = useState<number | null>(null);
    const [pageError, setPageError] = useState<string | null>(null);
    const [isLocationLoading, setLocationLoading] = useState(false)

    // Used to ensure the map is only set up once
    const [mapIsSetUp, setMapIsSetUp] = useState(false);

    const [map, setMap] = useState<L.Map | null>(null);

    const gpsMarker = L.marker([0, 0], { icon: locationMarkerIcon });
    const accurecyMarker = L.circle([0, 0], { radius: 0 })

    let mapHasBeenDragged = false
    // I don't want a new user locaiton to trigger a react rerender so I'm not using a state to store the location
    // After incoking the getlocation function, what ever funciton is here will be called with the new location when ever it's ready
    const getLocation = useUserLocation((position: GeolocationPosition) => {
        if (!map) return;
        setLocationLoading(false)
        gpsMarker.setLatLng([position.coords.latitude, position.coords.longitude])
        accurecyMarker.setLatLng([position.coords.latitude, position.coords.longitude])
        accurecyMarker.setRadius(position.coords.accuracy)
        if (!mapHasBeenDragged) {
            map.panTo(new L.LatLng(position.coords.latitude, position.coords.longitude));
        }
    }, (errorMessage: string) => {
        setLocationLoading(false)
        setPageError(errorMessage)
    });

    const zoomToUserLocation = () => {
        if (!map) return;
        map.panTo(accurecyMarker.getLatLng());
    };

    let alreadyWatching = false;
    const startTrackingUserLocation = () => {
        if (!map) return;
        // if the user is already watching, just zoom to the location
        if (alreadyWatching) {
            zoomToUserLocation();
        }else {
            setLocationLoading(true);
        }
        // otherwise place the marker and add the event listener
        alreadyWatching = true;
        getLocation()
        gpsMarker.addTo(map);
        accurecyMarker.addTo(map);
        // after clicking the location button location is updated where a gps watch event occurs
        mapHasBeenDragged = false;
        // if the user drags the map, the map no loger updates to the users new location
        map.on('dragstart', () => {
            mapHasBeenDragged = true;
            map.removeEventListener('dragstart');
        });
    }

    const resetMapToStartingLocation = () => {
        if (!map) return;
        mapHasBeenDragged = true;
        map.panTo(startingPosition);
    }

    const setUpMapBuilder = () => {
        if (!map || mapIsSetUp) return;
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
        if (currentFloor === null || !map) {
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
            if(area.entrances){
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
        <main className="ViewerMain">
            <Group className="floorsContainer" >
                {floorListElements}
                <Button onClick={startTrackingUserLocation}>
                {isLocationLoading ?
                    "loading"
                    :
                    <img src="/location.svg" alt="Get GPS Location" />
                }
                </Button>
                <Button onClick={resetMapToStartingLocation}><img src="/resetLocation.svg" alt="Reset Location" /></Button>
            </Group>
            <FormErrorNotification className="MapViewerNotification" formError={pageError} onClose={() => setPageError(null)} />
            <MapContainer
                center={startingPosition}
                zoom={19}
                zoomSnap={0.5}
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

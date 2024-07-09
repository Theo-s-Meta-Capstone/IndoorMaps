import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from 'react-leaflet'
import { graphql, useFragment } from "react-relay";
import { BuildingViewerBodyFragment$key } from "./__generated__/BuildingViewerBodyFragment.graphql";
import { useState } from "react";
import { Button } from "@mantine/core";
import { locationMarkerIcon } from "../../../utils/markerIcon";
import { useUserLocation } from "../../../utils/hooks";
import FormErrorNotification from "../../forms/FormErrorNotification";
import ViewerMapLoader from "./ViewerMapLoader";

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
    ...ViewerMapLoaderFragment
  }
`;

type Props = {
    buildingFromParent: BuildingViewerBodyFragment$key;
}

const BuildingViewerBody = ({ buildingFromParent }: Props) => {
    const building = useFragment(BuildingViewerFragment, buildingFromParent);
    const startingPosition = L.latLng(building.startPos.lat, building.startPos.lon);
    const mapStyle = { height: '70vh', width: '100%', padding: 0, zIndex: 50 };
    const [pageError, setPageError] = useState<string | null>(null);
    const [isLocationLoading, setLocationLoading] = useState(false)

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
        } else {
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

    return (
        <main className="ViewerMain">
            <FormErrorNotification className="MapViewerNotification" formError={pageError} onClose={() => setPageError(null)} />
            {map ?
                <ViewerMapLoader map={map} buildingFromParent={building}>
                    <Button onClick={startTrackingUserLocation}>
                        {isLocationLoading ?
                            "loading"
                            :
                            <img src="/location.svg" alt="Get GPS Location" />
                        }
                    </Button>
                    <Button onClick={resetMapToStartingLocation}><img src="/resetLocation.svg" alt="Reset Location" /></Button>
                </ViewerMapLoader>
                : null
            }
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

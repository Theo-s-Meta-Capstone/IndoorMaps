import { useRef, useState } from "react";
import * as L from "leaflet";
import { locationMarkerIcon } from "../../utils/markerIcon";
import { useUserLocation } from "../../utils/hooks";
import { Button } from "@mantine/core";


type Props = {
    map: L.Map;
    setPageError: (errorMessage: string) => void;
    buildingAnkerLatLon: L.LatLng;
}

const DisplayMyLiveLocation = ({ map, setPageError, buildingAnkerLatLon }: Props) => {
    const [isLocationLoading, setLocationLoading] = useState(false)
    const [alreadyWatching, setAlreadyWatching] = useState(false)
    const [gpsMarker,] = useState(L.marker([0, 0], { icon: locationMarkerIcon }));
    const [accurecyMarker,] = useState(L.circle([0, 0], { radius: 0 }))
    const mapHasBeenDragged = useRef(false)

    const updateUserLocation = (position: GeolocationPosition) => {
        setLocationLoading(false)
        gpsMarker.setLatLng([position.coords.latitude, position.coords.longitude])
        accurecyMarker.setLatLng([position.coords.latitude, position.coords.longitude])
        accurecyMarker.setRadius(position.coords.accuracy)
        if (!mapHasBeenDragged.current) {
            map.panTo(new L.LatLng(position.coords.latitude, position.coords.longitude));
        }
    }
    // I don't want a new user locaiton to trigger a react rerender so I'm not using a state to store the location
    // After incoking the getlocation function, what ever funciton is here will be called with the new location when ever it's ready
    const getLocation = useUserLocation((position: GeolocationPosition) => {
        updateUserLocation(position)
    }, (errorMessage: string) => {
        setLocationLoading(false)
        setPageError(errorMessage)
    });

    const zoomToUserLocation = () => {
        map.panTo(accurecyMarker.getLatLng());
    };

    const startTrackingUserLocation = () => {
        // if the user is already watching, just zoom to the location
        if (alreadyWatching) {
            zoomToUserLocation();
        } else {
            // otherwise place the marker and add the event listener
            setLocationLoading(true);
            gpsMarker.addTo(map);
            accurecyMarker.addTo(map);
            accurecyMarker.getElement()?.classList.add("accurecyMarker")
            getLocation()
        }
        setAlreadyWatching(true)
        // after clicking the location button location is updated where a gps watch event occurs
        mapHasBeenDragged.current = false;
        // if the user drags the map, the map no loger updates to the users new location
        map.on('dragstart', () => {
            mapHasBeenDragged.current = true;
        });
    }

    const resetMapToStartingLocation = () => {
        mapHasBeenDragged.current = true;
        map.panTo(buildingAnkerLatLon);
    }
    return (<>
        <Button color="dark-blue" onClick={startTrackingUserLocation}>
            {isLocationLoading ?
                "loading"
                :
                <img src="/location.svg" alt="Get GPS Location" />
            }
        </Button>
        <Button color="dark-blue" onClick={resetMapToStartingLocation}><img src="/resetLocation.svg" alt="Reset Location" /></Button>
    </>)
}

export default DisplayMyLiveLocation;

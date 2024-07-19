import L, { LatLng } from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import { graphql, useSubscription } from "react-relay";
import { useParams } from "react-router-dom";
import { DisplayLiveMarkersSubscription, DisplayLiveMarkersSubscription$data } from "./__generated__/DisplayLiveMarkersSubscription.graphql";
import { AreaToAreaRouteInfo, LiveLocationMarker } from "../../utils/types";
import { locationMarkerIcon } from "../../utils/markerIcon";

const subscription = graphql`
  subscription DisplayLiveMarkersSubscription($data: BuildingUniqueInput!) {
  newLiveLocation(data: $data) {
    id
    latitude
    longitude
    name
    message
  }
}
`;

type Props = {
    map: L.Map;
    areaToAreaRouteInfo: AreaToAreaRouteInfo,
    setAreaToAreaRouteInfo: (newdata: AreaToAreaRouteInfo) => void,
    floorDatabaseId: number | null,
}

const locationLeafletMarkers: { [key: string]: L.Marker } = {};

const DispalyLiveMarkers = ({ map, areaToAreaRouteInfo, setAreaToAreaRouteInfo, floorDatabaseId }: Props) => {
    const { buildingId } = useParams();
    let locationMarkers: LiveLocationMarker[] = [];
    const areaToAreaRouteInfoRef = useRef(areaToAreaRouteInfo);

    useEffect(() => {
        areaToAreaRouteInfoRef.current = areaToAreaRouteInfo;
    }, [areaToAreaRouteInfo])

    const addLocationMarkerToMap = (locationMarker: LiveLocationMarker) => {
        if (!locationLeafletMarkers[locationMarker.id]) {
            locationLeafletMarkers[locationMarker.id] = L.marker([locationMarker.latitude, locationMarker.longitude], { icon: locationMarkerIcon });
            locationLeafletMarkers[locationMarker.id].bindTooltip(locationMarker.name, { permanent: true, className: "title", offset: [0, 0] })
            if (locationMarker.message.length > 0) {
                locationLeafletMarkers[locationMarker.id].bindPopup(locationMarker.message, { className: "description", offset: [0, 0] })
            }
            locationLeafletMarkers[locationMarker.id].addTo(map);
            locationLeafletMarkers[locationMarker.id].getElement()?.classList.add("liveLocationMarker");
            locationLeafletMarkers[locationMarker.id].getTooltip()?.getElement()?.classList.add("liveLocationMarker");
            locationLeafletMarkers[locationMarker.id].getPopup()?.getElement()?.classList.add("liveLocationMarker");
        } else {
            locationLeafletMarkers[locationMarker.id].setLatLng([locationMarker.latitude, locationMarker.longitude]);
            if(floorDatabaseId && areaToAreaRouteInfoRef.current.to?.isLatLon && areaToAreaRouteInfoRef.current.to.id === locationMarker.id) {
                setAreaToAreaRouteInfo({
                    ...areaToAreaRouteInfoRef.current,
                    to: {
                        isLatLon: true,
                        location: new LatLng(locationMarker.latitude, locationMarker.longitude),
                        floorDatabaseId,
                        title: locationMarker.name,
                        description: locationMarker.message,
                        id: locationMarker.id,
                    }
                })
            }
        }
        locationLeafletMarkers[locationMarker.id].removeEventListener("click");
        locationLeafletMarkers[locationMarker.id].addEventListener("click", () => {
            if(!floorDatabaseId) return;
            setAreaToAreaRouteInfo({
                ...areaToAreaRouteInfoRef.current,
                to: {
                    isLatLon: true,
                    location: new LatLng(locationMarker.latitude, locationMarker.longitude),
                    floorDatabaseId,
                    title: locationMarker.name,
                    description: locationMarker.message,
                    id: locationMarker.id,
                }
            })
        });
    }

    // // If a item exists in locationMarkers with the same id, that item is replaced with the new item
    // // otherwise the new item is added at the end
    const handleSetLocationMarkers = (newLocation: LiveLocationMarker) => {
        let changeFound = false
        const newVal = locationMarkers.map((oldVal) => {
            if (oldVal.id == newLocation.id) {
                changeFound = true;
                return newLocation;
            }
            return oldVal;
        })
        if (!changeFound) {
            newVal.push(newLocation);
        }
        locationMarkers = newVal;
        locationMarkers.forEach((locationMarker) => { addLocationMarkerToMap(locationMarker) })
    }

    const config = useMemo(() => ({
        variables: {
            "data": {
                // setting this to -1 if null is pretty safe becuase it just means that on the backend it will
                // only recieve inputs from a user at a building with id -1 which should not happen
                "id": parseInt(buildingId ?? "-1")
            }
        },
        subscription,
        onNext: (response: DisplayLiveMarkersSubscription$data | null | undefined) => {
            if (!response) {
                return;
            }
            handleSetLocationMarkers(response.newLiveLocation)
        },
        onError: (err: Error) => {
            console.error(err)
        },
        onCompleted: () => { },
    }), [subscription]);

    useSubscription<DisplayLiveMarkersSubscription>(config);

    return (
        <></>
    )
}

export default DispalyLiveMarkers;

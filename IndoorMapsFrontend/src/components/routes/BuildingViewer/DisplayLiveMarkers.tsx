import L from "leaflet";
import { useMemo } from "react";
import { graphql, useSubscription } from "react-relay";
import { useParams } from "react-router-dom";
import { DisplayLiveMarkersSubscription, DisplayLiveMarkersSubscription$data } from "./__generated__/DisplayLiveMarkersSubscription.graphql";
import { LiveLocationMarker } from "../../../utils/types";
import { locationMarkerIcon } from "../../../utils/markerIcon";

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
}

const locationLeafletMarkers: { [key: string]: L.Marker } = {};

const DispalyLiveMarkers = ({ map }: Props) => {
    const { buildingId } = useParams();
    let locationMarkers: LiveLocationMarker[] = [];

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
        locationMarkers.forEach((locationMarker) => {
            if (!locationLeafletMarkers[locationMarker.id]) {
                locationLeafletMarkers[locationMarker.id] = L.marker([locationMarker.latitude, locationMarker.longitude], { icon: locationMarkerIcon });
                locationLeafletMarkers[locationMarker.id].bindTooltip(locationMarker.name, { permanent: true, className: "title", offset: [0, 0] })
                if (locationMarker.message.length > 0) {
                    locationLeafletMarkers[locationMarker.id].bindPopup(locationMarker.message, { className: "description", offset: [0, 0] })
                }
                locationLeafletMarkers[locationMarker.id].addTo(map);
            } else {
                locationLeafletMarkers[locationMarker.id].setLatLng([locationMarker.latitude, locationMarker.longitude]);
                locationLeafletMarkers[locationMarker.id].bindTooltip(locationMarker.name, { permanent: true, className: "title", offset: [0, 0] })
                if (locationMarker.message.length > 0) {
                    locationLeafletMarkers[locationMarker.id].bindPopup(locationMarker.message, { className: "description", offset: [0, 0] })
                } else {
                    locationLeafletMarkers[locationMarker.id].unbindPopup()
                }
            }
        })
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

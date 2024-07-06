import * as L from "leaflet";

export const DoorMarkerIcon = L.icon({
    shadowUrl: undefined,
    iconAnchor: new L.Point(15, 15),
    iconSize: new L.Point(30, 30),
    iconUrl: '/door.svg'
})

export const locationMarkerIcon = L.icon({
    shadowUrl: undefined,
    iconAnchor: new L.Point(15, 15),
    iconSize: new L.Point(30, 30),
    iconUrl: '/locationMarker.svg'
})

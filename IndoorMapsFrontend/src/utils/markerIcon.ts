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

export const IndoorDoorMarkerIcon = L.icon({
    shadowUrl: undefined,
    iconAnchor: new L.Point(12, 12),
    iconSize: new L.Point(24, 24),
    iconUrl: '/indoorDoor.svg'
})

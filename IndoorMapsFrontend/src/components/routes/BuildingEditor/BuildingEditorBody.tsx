import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet'
import { GeomanControl } from "./GeomanControl";

interface Props {
}

const BuildingEditorBody = ({ }: Props) => {
    const washingtonDC = L.latLng(38.9072, -77.0369);
    const mapStyle = { height: '50vh', width: '100%', padding: 0 };

    // Used to ensure the map is only set up once
    const [mapIsSetUp, setMapIsSetUp] = useState(false);

    const [map, setMap] = useState<L.Map | null>(null);

    const printLayers = () => {
        if (map) {
            console.log(map.pm.getGeomanLayers());
        }
    };

    const setUpMapBuilder = () => {
        if(!map || mapIsSetUp) return;
        setMapIsSetUp(true)
        map.on('pm:create', function (e) {
            console.log(e);
        });
    }

    useEffect(() => {
        setUpMapBuilder();
    }, [map]);

    return (
        <>
        <button onClick={() => printLayers()}>Log layers</button>
        <MapContainer
            center={washingtonDC}
            zoom={21}
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
            <GeomanControl position="topright" drawCircle={false} oneBlock />
        </MapContainer>
        </>
    )
}

export default BuildingEditorBody;

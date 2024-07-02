import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet'
import { GeomanControl } from "./GeomanControl";
import { graphql, useFragment } from "react-relay";
import { BuildingEditorBodyFragment$key } from "./__generated__/BuildingEditorBodyFragment.graphql";

const BuildingEditorFragment = graphql`
  fragment BuildingEditorBodyFragment on Building
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
      title
      address
    }
  }
`;

interface Props {
    buildingFromParent: BuildingEditorBodyFragment$key;
}

const BuildingEditorBody = ({ buildingFromParent }: Props) => {
    const buildingData = useFragment(BuildingEditorFragment, buildingFromParent);
    const startingPosition = L.latLng(buildingData.startPos.lat, buildingData.startPos.lon);
    const mapStyle = { height: '50vh', width: '100%', padding: 0 };
    const [editMode, setEditMode] = useState("floor");

    // Used to ensure the map is only set up once
    const [mapIsSetUp, setMapIsSetUp] = useState(false);

    const [map, setMap] = useState<L.Map | null>(null);

    const printLayers = () => {
        if (map) {
            console.log(map.pm.getGeomanLayers());
        }
    };

    const onShapeEdit = (event: L.LeafletEvent) => {
        console.log(event);
        console.log(event.layer.toGeoJSON());
    }

    const onShapeCreate = (event: L.LeafletEvent) => {
        console.log(event);
        console.log(event.layer.toGeoJSON());

        event.layer.on('pm:edit', onShapeEdit)
    }

    const setUpMapBuilder = () => {
        if(!map || mapIsSetUp) return;
        setMapIsSetUp(true)
        map.on('pm:create', onShapeCreate);
    }

    useEffect(() => {
        setUpMapBuilder();
    }, [map]);

    return (
        <>
        <button onClick={() => printLayers()}>Log layers</button>
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
            <GeomanControl position="topright" drawCircle={false} oneBlock />
        </MapContainer>
        </>
    )
}

export default BuildingEditorBody;

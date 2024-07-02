import "./styles/BuildingEditorBody.css"
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet'
import { GeomanControl } from "./GeomanControl";
import { graphql, useFragment } from "react-relay";
import { BuildingEditorBodyFragment$key } from "./__generated__/BuildingEditorBodyFragment.graphql";
import EditorSidebar from "./EditorSidebar";

const BuildingEditorFragment = graphql`
  fragment BuildingEditorBodyFragment on Building
  {
    ...EditorSidebarBodyFragment
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
      description
      shape
    }
  }
`;

interface Props {
    buildingFromParent: BuildingEditorBodyFragment$key;
}

const BuildingEditorBody = ({ buildingFromParent }: Props) => {
    const buildingData = useFragment(BuildingEditorFragment, buildingFromParent);
    const startingPosition = L.latLng(buildingData.startPos.lat, buildingData.startPos.lon);
    const mapStyle = { height: '70vh', width: '100%', padding: 0, zIndex: 50 };
    // const [editMode, setEditMode] = useState("floor");

    // Used to ensure the map is only set up once
    const [mapIsSetUp, setMapIsSetUp] = useState(false);

    const [map, setMap] = useState<L.Map | null>(null);

    const onShapeEdit = (event: L.LeafletEvent) => {
        if (!map) return;
        console.log(event.layer.toGeoJSON)
        console.log(map.pm.getGeomanLayers(true))
        console.log(map.pm.getGeomanDrawLayers(true));
    }

    const onShapeCreate = (event: L.LeafletEvent) => {
        if (!map) return;
        if (event.layer instanceof L.Polyline) {
            event.layer.setStyle({ color: 'black' });
            event.layer.toGeoJSON
        }
        console.log(map.pm.getGeomanLayers().map((layer: any) => layer.toGeoJSON()));
        console.log(map.pm.getGeomanDrawLayers());
        console.log(event);
        console.log(event.layer.toGeoJSON());
        event.layer.on('pm:edit', onShapeEdit)
    }

    const setUpMapBuilder = () => {
        if (!map || mapIsSetUp) return;
        setMapIsSetUp(true)
        map.on('pm:create', onShapeCreate);

        // Setting Up the Place Entrances Control
        map.pm.Toolbar.copyDrawControl('drawMarker', {
            name: 'Entrances',
            title: 'Place Entrances',
        });
        // Used to change the text that apears when placing a marker
        // found here: https://stackoverflow.com/questions/74991124/editing-geoman-map-cursor-tooltip
        const customTranslation = {
            tooltips: {
                placeMarker: 'Click to Place Entrance',
            },
        };
        map.pm.setLang('en', customTranslation, 'en');
    }

    useEffect(() => {
        setUpMapBuilder();
    }, [map]);

    return (
        <main className="EditorMain">
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
                <GeomanControl />
            </MapContainer>
            <EditorSidebar buildingFromParent={buildingData}/>
        </main>
    )
}

export default BuildingEditorBody;

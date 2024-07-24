import "./styles/BuildingEditorBody.css"
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Suspense, useEffect, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet'
import { GeomanControl } from "./GeomanControl";
import { graphql, useFragment } from "react-relay";
import { BuildingEditorBodyFragment$key } from "./__generated__/BuildingEditorBodyFragment.graphql";
import EditorSidebar from "./EditorSidebar";
import { DoorMarkerIcon } from "../../utils/markerIcon";

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

type Props = {
    buildingFromParent: BuildingEditorBodyFragment$key;
}

const BuildingEditorBody = ({ buildingFromParent }: Props) => {
    const buildingData = useFragment(BuildingEditorFragment, buildingFromParent);
    const startingPosition = L.latLng(buildingData.startPos.lat, buildingData.startPos.lon);
    const mapStyle = { height: '100%', width: '100%', padding: 0, zIndex: 50 };

    // Used to ensure the map is only set up once
    const [mapIsSetUp, setMapIsSetUp] = useState(false);

    const [map, setMap] = useState<L.Map | null>(null);

    const setUpMapBuilder = () => {
        if (!map || mapIsSetUp) return;
        setMapIsSetUp(true)
        // Setting Up the Place Entrances Control
        const doorMarker = map.pm.Toolbar.copyDrawControl('drawMarker', {
            name: 'Entrances',
            title: 'Place Entrances',
        });
        doorMarker.drawInstance.setOptions({ markerStyle: { icon: DoorMarkerIcon } });
        // Used to change the text that apears when placing a marker
        // found here: https://stackoverflow.com/questions/74991124/editing-geoman-map-cursor-tooltip
        const customTranslation = {
            tooltips: {
                placeMarker: 'Click to Place Entrance',
            },
        };
        map.pm.setLang('en', customTranslation, 'en');

        // Disabling the Drawing Tools, These are then re-enabled based in the sidebar
        map.pm.Toolbar.setButtonDisabled("Polygon", true);
        map.pm.Toolbar.setButtonDisabled("Entrances", true);
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
                style={mapStyle}
                ref={setMap}
            >
                <Suspense>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxNativeZoom={18}
                        maxZoom={27}
                    />
                    <GeomanControl />
                </Suspense>
            </MapContainer>
            {map ?
                <EditorSidebar map={map} buildingFromParent={buildingData} />
                : null}
        </main>
    )
}

export default BuildingEditorBody;

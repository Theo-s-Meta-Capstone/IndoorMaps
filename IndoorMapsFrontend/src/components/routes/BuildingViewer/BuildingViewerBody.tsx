import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from 'react-leaflet'
import { graphql, useFragment } from "react-relay";
import { BuildingViewerBodyFragment$key } from "./__generated__/BuildingViewerBodyFragment.graphql";
import { useState } from "react";
import FormErrorNotification from "../../forms/FormErrorNotification";
import ViewerMapLoader from "./ViewerMapLoader";
import DispalyLiveMarkers from "./DisplayLiveMarkers";
import DisplayMyLiveLocation from "./DisplayMyLiveLocation";
import AreaSearch from "./AreaSearch";
import { AreaToAreaRouteInfo } from "../../../utils/types";

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
    const buildingAnkerLatLon = new L.LatLng(building.startPos.lat, building.startPos.lon)
    const mapStyle = { height: '100%', width: '100%', padding: 0, zIndex: 50 };
    const [pageError, setPageError] = useState<string | null>(null);
    const [areaToAreaRouteInfo, setAreaToAreaRouteInfo] = useState<AreaToAreaRouteInfo>({});
    const [map, setMap] = useState<L.Map | null>(null);

    const handleUpdateAreaToAreaRouteInfo = (newRouteData: AreaToAreaRouteInfo) => {
        setAreaToAreaRouteInfo(newRouteData);
    }

    return (
        <main className="ViewerMain">
            <FormErrorNotification className="MapViewerNotification" formError={pageError} onClose={() => setPageError(null)} />
            <MapContainer
                center={buildingAnkerLatLon}
                zoom={19}
                zoomSnap={0.5}
                style={mapStyle}
                ref={setMap}
            >
                {map ?
                    <ViewerMapLoader areaToAreaRouteInfo={areaToAreaRouteInfo} map={map} buildingFromParent={building}>
                        <DisplayMyLiveLocation setPageError={(errorMessage) => { setPageError(errorMessage) }} buildingAnkerLatLon={buildingAnkerLatLon} map={map} />
                        <DispalyLiveMarkers map={map} />
                    </ViewerMapLoader>
                    : null
                }
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxNativeZoom={18}
                    maxZoom={27}
                />
            </MapContainer>
            <AreaSearch areaToAreaRouteInfo={areaToAreaRouteInfo} setAreaToAreaRouteInfo={handleUpdateAreaToAreaRouteInfo} buildingId={building.databaseId} />
        </main>
    )
}

export default BuildingViewerBody;

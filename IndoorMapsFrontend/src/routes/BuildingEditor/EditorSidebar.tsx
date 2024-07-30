import { graphql, useFragment } from "react-relay";
import { EditorSidebarBodyFragment$key } from "./__generated__/EditorSidebarBodyFragment.graphql";
import { useEffect, useState } from "react";
import * as L from "leaflet";
import FloorSidebar from "./FloorSidebar";
import { useBooleanState } from "../../utils/hooks";
import AreaSidebar from "./AreaSidebar";
import { Group } from "@mantine/core";
import { DoorMarkerIcon } from "../../utils/markerIcon";
import { removeAllLayersFromLayerGroup } from "../../utils/utils";
import { useSearchParams } from "react-router-dom";

const EditorSidebarFragment = graphql`
  fragment EditorSidebarBodyFragment on Building
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
      databaseId
      shape
      ...AreaSidebarBodyFragment
    }
    ...FloorSidebarBodyFragment
  }
`;

type Props = {
  buildingFromParent: EditorSidebarBodyFragment$key;
  map: L.Map;
}

const floorMapLayer = L.geoJSON(null, {
  pointToLayer: function (_feature, latlng) {
    return L.marker(latlng, { icon: DoorMarkerIcon });
  }
});
const imageOverlayMapLayer = L.geoJSON();
const areasMapLayer = L.geoJSON();
const areaEntranceMapLayer = L.geoJSON();

const EditorSidebar = ({ buildingFromParent, map }: Props) => {
  const building = useFragment(EditorSidebarFragment, buildingFromParent);
  const [currentFloor, setCurrentFloor] = useState<number | null>(null);
  const [isAreaSidebarOpen, closeAreaSidebar, openAreaSidebar] = useBooleanState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const handleFloorChange = (newFloor: number) => {
    setCurrentFloor(newFloor);
  }

  useEffect(() => {
    if (currentFloor == null && building.floors.length !== 0) {
      let initialFloor = building.floors[0].databaseId;
      const floorFromUrlSearchParams = searchParams.get("floor");
      if (floorFromUrlSearchParams && building.floors.find((floor) => floor.databaseId === parseInt(floorFromUrlSearchParams))) {
        initialFloor = parseInt(floorFromUrlSearchParams);
      }
      setCurrentFloor(initialFloor)
    }
  }, [building.floors])

  const handleCloseAreaSidebar = () => {
    removeAllLayersFromLayerGroup(areaEntranceMapLayer, map);
    floorMapLayer.getLayers().map((layer) => {
      if (layer instanceof L.Polygon) {
        layer.setStyle({ color: 'blue' });
      }
    })
    floorMapLayer.pm.enable()

    areasMapLayer.getLayers().map((layer) => {
      if (layer instanceof L.Polygon) {
        layer.setStyle({ color: 'black' });
      }
    })
    // Both of these are needed to disable editing
    // This one makes it so if you are currently in edit mode it stops being editable
    // this only seems to work for the vetector move edit mode and not the dragging or rotating
    areasMapLayer.pm.disable()
    // This one makes it so enter edit mode it doesn't show as editable
    areasMapLayer.pm.setOptions({
      allowEditing: false,
      allowRemoval: false,
      allowRotation: false,
      draggable: false,
    })
    floorMapLayer.pm.setOptions({
      allowEditing: true,
      allowRemoval: true,
      allowRotation: true,
      draggable: true,
    })
    // disable drawing, useful if the user was drawing while on the floor sidebar
    map.pm.disableDraw()
    // Stops a bug with leaflet and addData:this._layer.getLatLngs is not a function
    map.pm.disableGlobalRotateMode();
    closeAreaSidebar();
  }

  const handleOpenAreaSidebar = () => {
    floorMapLayer.getLayers().map((layer) => {
      if (layer instanceof L.Polygon) {
        layer.setStyle({ color: 'black' });
      }
    })
    floorMapLayer.pm.disable()
    floorMapLayer.pm.setOptions({
      allowEditing: false,
      allowRemoval: false,
      allowRotation: false,
      draggable: false,
    })
    areasMapLayer.pm.setOptions({
      allowEditing: true,
      allowRemoval: true,
      allowRotation: true,
      draggable: true,
    })
    map.pm.disableDraw();
    map.pm.disableGlobalRotateMode();

    imageOverlayMapLayer.getLayers().map((layer) => {
      if (layer instanceof L.ImageOverlay || layer instanceof L.Rectangle) {
        layer.setStyle({ stroke: false, fill: false });
      }
    })
    openAreaSidebar();
  }

  // If the floor changes any left over areas from the previous floor needs to be removed
  useEffect(() => {
    removeAllLayersFromLayerGroup(areasMapLayer, map);
    if (!currentFloor) return
    setSearchParams(prev => {
      prev.set("floor", currentFloor.toString());
      return prev
    }, { replace: true })
  }, [currentFloor])

  return (
    <aside className="EditorSidebar">
      <Group justify="space-between">
      </Group>
      {isAreaSidebarOpen ?
        <AreaSidebar buildingId={building.databaseId} closeSidebar={handleCloseAreaSidebar} floorFromParent={building.floors.find((floor) => floor.databaseId == currentFloor)} map={map} areasMapLayer={areasMapLayer} areaEntranceMapLayer={areaEntranceMapLayer} />
        :
        <FloorSidebar imageOverlayMapLayer={imageOverlayMapLayer} openAreaSidebar={handleOpenAreaSidebar} setCurrentFloor={handleFloorChange} floorMapLayer={floorMapLayer} currentFloor={currentFloor} buildingFromParent={building} map={map} />
      }
    </aside>
  )
}

export default EditorSidebar;

import { graphql, useFragment } from "react-relay";
import { EditorSidebarBodyFragment$key } from "./__generated__/EditorSidebarBodyFragment.graphql";
import { useEffect, useState } from "react";
import * as L from "leaflet";
import FloorSidebar from "./FloorSidebar";
import { useBooleanState } from "../../../utils/hooks";
import AreaSidebar from "./AreaSidebar";
import { Group } from "@mantine/core";
import { DoorMarkerIcon } from "../../../utils/markerIcon";
import { removeAllLayersFromLayerGroup } from "../../../utils/utils";

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
    return L.marker(latlng, {icon: DoorMarkerIcon});
  }
});
const areasMapLayer = L.geoJSON();
const areaEntranceMapLayer = L.geoJSON();

const EditorSidebar = ({ buildingFromParent, map }: Props) => {
  const building = useFragment(EditorSidebarFragment, buildingFromParent);
  const [currentFloor, setCurrentFloor] = useState<number | null>(null);
  const [isAreaSidebarOpen, closeAreaSidebar, openAreaSidebar] = useBooleanState(false);

  const handleFloorChange = (newFloor: number) => {
    setCurrentFloor(newFloor);
  }

  useEffect(() => {
    if (currentFloor == null && building.floors.length !== 0) {
      setCurrentFloor(building.floors[0].databaseId)
    }
  }, [building.floors])

  const handleCloseAreaSidebar = () => {
    removeAllLayersFromLayerGroup(areasMapLayer, map);
    removeAllLayersFromLayerGroup(areaEntranceMapLayer, map);
    floorMapLayer.getLayers().map((layer) => {
      if (layer instanceof L.Polygon) {
        layer.setStyle({ color: 'blue' });
      }
    })
    floorMapLayer.pm.enable()
    floorMapLayer.pm.setOptions({
      allowEditing: true,
    })
    closeAreaSidebar();
  }

  const handleOpenAreaSidebar = () => {
    floorMapLayer.getLayers().map((layer) => {
      if (layer instanceof L.Polygon) {
        layer.setStyle({ color: 'black' });
      }
    })
    // Both of these are needed to disable editing
    // This one makes it so if you are currently in edit mode it stops being editable
    // this only seems to work for the vetector move edit mode and not the dragging or rotating
    floorMapLayer.pm.disable()
    // This one makes it so enter edit mode it doesn't show as editable
    floorMapLayer.pm.setOptions({
      allowEditing: false,
      allowCutting: false,
      allowRemoval: false,
      allowRotation: false,
      draggable: false,
    })
    // disable drawing, useful if the user was drawing while on the floor sidebar
    map.pm.disableDraw();
    openAreaSidebar();
  }

  return (
    <aside className="EditorSidebar">
      <Group justify="space-between">
      </Group>
      {isAreaSidebarOpen ?
        <AreaSidebar closeSidebar={handleCloseAreaSidebar} floorFromParent={building.floors.find((floor) => floor.databaseId == currentFloor)} map={map} areasMapLayer={areasMapLayer} areaEntranceMapLayer={areaEntranceMapLayer} />
        :
        <FloorSidebar openAreaSidebar={handleOpenAreaSidebar} setCurrentFloor={handleFloorChange} floorMapLayer={floorMapLayer} currentFloor={currentFloor} buildingFromParent={building} map={map} />
      }
    </aside>
  )
}

export default EditorSidebar;

import { graphql, useFragment } from "react-relay";
import { EditorSidebarBodyFragment$key } from "./__generated__/EditorSidebarBodyFragment.graphql";
import { useEffect, useState } from "react";
import * as L from "leaflet";
import FloorSidebar from "./FloorSidebar";
import { useBooleanState } from "../../../hooks";
import AreaSidebar from "./AreaSidebar";
import { Button, Group } from "@mantine/core";

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
    }
    ...FloorSidebarBodyFragment
  }
`;

interface Props {
  buildingFromParent: EditorSidebarBodyFragment$key;
  map: L.Map;
}

const floor = L.geoJSON();

const EditorSidebar = ({ buildingFromParent, map }: Props) => {
  const building = useFragment(EditorSidebarFragment, buildingFromParent);
  const [currentFloor, setCurrentFloor] = useState<number | null>(null);
  const [isAreaSidebarOpen, handleCloseAreaSidebar, handleOpenAreaSidebar] = useBooleanState(false);

  const handleFloorChange = (newFloor: number) => {
    setCurrentFloor(newFloor);
  }

  useEffect(() => {
    if (currentFloor == null && building.floors.length !== 0) {
      setCurrentFloor(building.floors[0].databaseId)
    }
  }, [building.floors])

  return (
    <aside className="EditorSidebar">
      <Group justify="space-between">
        <Button onClick={handleCloseAreaSidebar} disabled={!isAreaSidebarOpen}>Add + Edit Floors</Button>
        <Button onClick={handleOpenAreaSidebar} disabled={isAreaSidebarOpen}>Add + Edit Areas</Button>
      </Group>
      {isAreaSidebarOpen ?
        <AreaSidebar />
        :
        <FloorSidebar setCurrentFloor={handleFloorChange} floor={floor} currentFloor={currentFloor} buildingFromParent={building} map={map} />
      }
    </aside>
  )
}

export default EditorSidebar;

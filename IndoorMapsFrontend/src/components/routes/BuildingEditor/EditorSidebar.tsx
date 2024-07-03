import { graphql, useFragment } from "react-relay";
import { EditorSidebarBodyFragment$key } from "./__generated__/EditorSidebarBodyFragment.graphql";
import { useEffect, useState } from "react";
import * as L from "leaflet";
import FloorSidebar from "./FloorSidebar";

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
      <FloorSidebar setCurrentFloor={handleFloorChange} floor={floor} currentFloor={currentFloor} buildingFromParent={building} map={map} />
    </aside>
  )
}

export default EditorSidebar;

import { graphql, useFragment } from "react-relay";
import { EditorSidebarBodyFragment$key } from "./__generated__/EditorSidebarBodyFragment.graphql";
import CreateFloorModal from "../../forms/CreateFloorModal";
import { useBooleanState } from "../../../hooks";
import { Button, ScrollArea } from "@mantine/core";
import FloorListItem from "./FloorListItem";
import { useEffect, useState } from "react";

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
      ...FloorListItemFragment
    }
  }
`;

interface Props {
  buildingFromParent: EditorSidebarBodyFragment$key;
}

const EditorSidebar = ({ buildingFromParent }: Props) => {
  const buildingData = useFragment(EditorSidebarFragment, buildingFromParent);
  const [isCreateFloorModalOpen, handleCloseCreateFloorModal, handleOpenCreateFloorModal] = useBooleanState(false);
  const [currentFloor, setCurrentFloor] = useState<number>(-1);

  const handleFloorChange = (newFloor: number) => {
    setCurrentFloor(newFloor);
  }

  useEffect(() => {
    if(buildingData.floors.length !== 0) {
      console.log(buildingData.floors[0].databaseId)
      setCurrentFloor(buildingData.floors[0].databaseId)
    }
  }, [])

  const floorListElements = buildingData.floors.map((floor, i) => (<FloorListItem setCurrentFloor={handleFloorChange} currentFloor={currentFloor} floorFromParent={floor} key={i} />));

  return (
    <aside className="EditorSidebar">
      <h1>Editor Sidebar</h1>
      <Button onClick={handleOpenCreateFloorModal}>New Floor</Button>
      <CreateFloorModal isOpen={isCreateFloorModalOpen} closeModal={handleCloseCreateFloorModal} />
      <ScrollArea h={250}>
        {floorListElements}
      </ScrollArea>
    </aside>
  )
}

export default EditorSidebar;

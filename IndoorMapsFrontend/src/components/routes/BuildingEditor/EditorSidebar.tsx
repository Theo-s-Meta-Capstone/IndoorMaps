import { graphql, useFragment } from "react-relay";
import { EditorSidebarBodyFragment$key } from "./__generated__/EditorSidebarBodyFragment.graphql";
import CreateFloorModal from "../../forms/CreateFloorModal";
import { useBooleanState } from "../../../hooks";
import { Button } from "@mantine/core";

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
      title
      description
      shape
    }
  }
`;

interface Props {
    buildingFromParent: EditorSidebarBodyFragment$key;
}

const EditorSidebar = ({buildingFromParent}:Props) => {
    const buildingData = useFragment(EditorSidebarFragment, buildingFromParent);
    const [isCreateFloorModalOpen, handleCloseCreateFloorModal, handleOpenCreateFloorModal] = useBooleanState(false);

    return (
        <div>
            <h1>Editor Sidebar</h1>
            <Button onClick={handleOpenCreateFloorModal}>New Floor</Button>
            <CreateFloorModal isOpen={isCreateFloorModalOpen} closeModal={handleCloseCreateFloorModal} />
            <div>{JSON.stringify(buildingData)}</div>
        </div>
    )
}

export default EditorSidebar;

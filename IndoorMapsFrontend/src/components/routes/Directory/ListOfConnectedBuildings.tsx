import "./styles/ListOfConnectedBuildings.css"
import { graphql, useFragment } from "react-relay";
import ConnectedBuildingItem from "./ConnectedBuildingItem";
import { ListOfConnectedBuildingsUserDataDisplayFragment$key } from "./__generated__/ListOfConnectedBuildingsUserDataDisplayFragment.graphql";
import { useBooleanState } from "../../../hooks";
import { Button } from "@mantine/core";
import CreateBuildingModal from "../../forms/CreateBuildingModal";

const ListOfConnectedBuildingsUserDataFragment = graphql`
  fragment ListOfConnectedBuildingsUserDataDisplayFragment on LogedInUser{
    id
    isLogedIn
    user {
        id
        ...CreateBuildingModalUserDataFormFragment
        BuildingWithPerms {
            ...ConnectedBuildingItemFragment
        }
    }
  }
`;

type ListOfConnectedBuildingsItemsFragmentProps = {
    getUserFromCookie: ListOfConnectedBuildingsUserDataDisplayFragment$key
}

function ListOfConnectedBuildings({ getUserFromCookie }: ListOfConnectedBuildingsItemsFragmentProps) {
    const [isCreateBuildingOpen, handleCloseCreateBuilding, handleOpenCreateBuilding] = useBooleanState(false);

    const data = useFragment(
        ListOfConnectedBuildingsUserDataFragment,
        getUserFromCookie,
    );
    if (!data.isLogedIn || !data.user) {
        return null;
    }
    const buildingItems = data.user.BuildingWithPerms.map((building, i) => {
        return <ConnectedBuildingItem key={i} buildingWithPerms={building} />
    })

    return (
        <div className="connectedBuildingsContainer">
            <Button onClick={handleOpenCreateBuilding}>Create Building</Button>
            <CreateBuildingModal userData={data.user} isOpen={isCreateBuildingOpen} closeModal={handleCloseCreateBuilding} />
            {buildingItems}
        </div>
    )

}

export default ListOfConnectedBuildings;

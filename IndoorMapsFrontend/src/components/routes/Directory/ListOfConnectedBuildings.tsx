import "./styles/ListOfConnectedBuildings.css"
import { graphql, useFragment } from "react-relay";
import ConnectedBuildingItem from "./ConnectedBuildingItem";
import { ListOfConnectedBuildingsUserDataDisplayFragment$key } from "./__generated__/ListOfConnectedBuildingsUserDataDisplayFragment.graphql";
import { useBooleanState } from "../../../hooks";
import { Button } from "@mantine/core";
import CreateBuildingModal from "../../forms/CreateBuildingModal";
import { AutoCompleteResultsFragment$key } from "../../forms/__generated__/AutoCompleteResultsFragment.graphql";

const ListOfConnectedBuildingsUserDataFragment = graphql`
  fragment ListOfConnectedBuildingsUserDataDisplayFragment on LogedInUser{
    id
    isLogedIn
    user {
        id
        BuildingWithPerms {
            id
            ...ConnectedBuildingItemFragment
        }
    }
  }
`;

type ListOfConnectedBuildingsItemsFragmentProps = {
    getUserFromCookie: ListOfConnectedBuildingsUserDataDisplayFragment$key,
    getGeocoder: AutoCompleteResultsFragment$key,
}

function ListOfConnectedBuildings({ getUserFromCookie, getGeocoder }: ListOfConnectedBuildingsItemsFragmentProps) {
    const [isCreateBuildingOpen, handleCloseCreateBuilding, handleOpenCreateBuilding] = useBooleanState(false);

    const { isLogedIn, user } = useFragment(
        ListOfConnectedBuildingsUserDataFragment,
        getUserFromCookie,
    );
    if (!isLogedIn || !user) {
        return null;
    }
    const buildingItems = user.BuildingWithPerms.map((building) => {
        return <ConnectedBuildingItem key={building.id} buildingWithPermsFromParent={building} />
    })

    return (
        <div className="connectedBuildingsContainer">
            <Button onClick={handleOpenCreateBuilding}>Create Building</Button>
            <CreateBuildingModal getGeocoder={getGeocoder} isOpen={isCreateBuildingOpen} closeModal={handleCloseCreateBuilding} />
            {buildingItems}
        </div>
    )

}

export default ListOfConnectedBuildings;

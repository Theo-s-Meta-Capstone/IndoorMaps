import { graphql, useFragment } from "react-relay";
import ConnectedBuildingItem from "./ConnectedBuildingItem";
import { ListOfConnectedBuildingsUserDataDisplayFragment$key } from "./__generated__/ListOfConnectedBuildingsUserDataDisplayFragment.graphql";
import { useBooleanState } from "../../utils/hooks";
import { Button, Group, Tooltip } from "@mantine/core";
import CreateBuildingModal from "../../components/forms/CreateBuildingModal";
import { AutoCompleteResultsFragment$key } from "../../components/forms/__generated__/AutoCompleteResultsFragment.graphql";
import CreateBuildingGroupModal from "../../components/forms/CreateBuildingGroupModal";

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
        buildingGroups {
            id
            databaseId
            name
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
    const [isCreateBuildingGroupOpen, handleCloseCreateBuildingGroup, handleOpenCreateBuildingGroup] = useBooleanState(false);

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
        <div className="buildingsTitle">
            <Group justify="space-between">
                <h2>Your Buildings:</h2>
                <Button color="dark-blue" onClick={handleOpenCreateBuilding}>Create Building</Button>
                <Tooltip label="Buildings in the same group will apear on eachother's map">
                    <Button color="dark-blue" onClick={handleOpenCreateBuildingGroup}>Create Building Group</Button>
                </Tooltip>
            </Group>
            <div className="connectedBuildingsContainer buildingsContainer">
                <CreateBuildingModal getGeocoder={getGeocoder} isOpen={isCreateBuildingOpen} closeModal={handleCloseCreateBuilding} />
                <CreateBuildingGroupModal isOpen={isCreateBuildingGroupOpen} closeModal={handleCloseCreateBuildingGroup}/>
                {buildingItems}
            </div>
        </div>
    )

}

export default ListOfConnectedBuildings;

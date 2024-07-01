import "./styles/ListOfConnectedBuildings.css"
import { graphql, useFragment } from "react-relay";
import ConnectedBuildingItem from "./ConnectedBuildingItem";
import { ListOfConnectedBuildingsUserDataDisplayFragment$key } from "./__generated__/ListOfConnectedBuildingsUserDataDisplayFragment.graphql";

const ListOfConnectedBuildingsUserDataFragment = graphql`
  fragment ListOfConnectedBuildingsUserDataDisplayFragment on LogedInUser{
    id
    isLogedIn
    user {
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
            {buildingItems}
        </div>
    )

}

export default ListOfConnectedBuildings;

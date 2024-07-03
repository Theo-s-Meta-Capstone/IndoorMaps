import BuildingItem from "./BuildingItem";
import { BuildingItemFragment$key } from "./__generated__/BuildingItemFragment.graphql";

type ListOfBuildingsProps = {
    buildings: readonly BuildingItemFragment$key[]
}

function ListOfBuildings({ buildings }: ListOfBuildingsProps) {
    // The key is the index and not the relay building id
    // Because the building data is not visible to this component (as it does not call useFragment)
    const buildingListElements = buildings.map((building, i) => {
        return(<BuildingItem key={i} building={building} />)
    })

    return (
      <>
      {buildingListElements}
      </>
    );
}

export default ListOfBuildings;

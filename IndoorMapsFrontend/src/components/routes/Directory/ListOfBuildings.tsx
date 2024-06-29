import BuildingItem from "./BuildingItem";
import { BuildingItemFragment$key } from "./__generated__/BuildingItemFragment.graphql";

type ListOfBuildingsProps = {
    buildings: readonly BuildingItemFragment$key[]
}

function ListOfBuildings({ buildings }: ListOfBuildingsProps) {

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

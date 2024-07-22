import { Group } from "@mantine/core";
import { graphql, useFragment } from "react-relay";
import { BuildingItemFragment$key } from "./__generated__/BuildingItemFragment.graphql";
import { Link } from "react-router-dom";

const BuildingFragment = graphql`
  fragment BuildingItemFragment on Building {
    id
    title
    address
    databaseId
  }
`;

type BuildingItemProps = {
    buildingFromParent: BuildingItemFragment$key;
}

function BuildingItem({ buildingFromParent }: BuildingItemProps) {
    const building = useFragment(
        BuildingFragment,
        buildingFromParent,
    );
    return (
        <Link to={`/building/${building.databaseId}/viewer`}>
            <Group className="buildingListItem">
                <h2>{building.title}</h2>
                <p>{building.address}</p>
            </Group>
        </Link>
    )
}

export default BuildingItem;

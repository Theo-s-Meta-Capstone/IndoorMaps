import { Link } from "react-router-dom";
import { graphql, useFragment } from "react-relay";
import { ConnectedBuildingItemFragment$key } from "./__generated__/ConnectedBuildingItemFragment.graphql";
import { Group } from "@mantine/core";

const ConnectedBuildingFragment = graphql`
    fragment ConnectedBuildingItemFragment on BuildingWithPerms {
        id
        editorLevel
        building {
            id
            databaseId
            title
            address
        }
    }
`;

type ConnectedBuildingItemProps = {
    buildingWithPerms: ConnectedBuildingItemFragment$key
}

function ConnectedBuildingItem({ buildingWithPerms }: ConnectedBuildingItemProps) {
    const data = useFragment(
        ConnectedBuildingFragment,
        buildingWithPerms,
    );
    return (
        <Link to={`/building/${data.building.databaseId}/editor`}>
            <Group>
                <h2>{data.building.title}</h2>
                <p>{data.building.address}</p>
                <p>you are: {data.editorLevel}</p>
            </Group>
        </Link>
    )
}

export default ConnectedBuildingItem;

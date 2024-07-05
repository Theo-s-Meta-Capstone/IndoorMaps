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
    buildingWithPermsFromParent: ConnectedBuildingItemFragment$key
}

function ConnectedBuildingItem({ buildingWithPermsFromParent }: ConnectedBuildingItemProps) {
    const buildingWithPerms = useFragment(
        ConnectedBuildingFragment,
        buildingWithPermsFromParent,
    );
    return (
        <Link to={`/building/${buildingWithPerms.building.databaseId}/editor`}>
            <Group>
                <h2>{buildingWithPerms.building.title}</h2>
                <p>{buildingWithPerms.building.address}</p>
                <p>you are: {buildingWithPerms.editorLevel}</p>
            </Group>
        </Link>
    )
}

export default ConnectedBuildingItem;

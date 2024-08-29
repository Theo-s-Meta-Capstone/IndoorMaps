import { Group } from "@mantine/core";
import { graphql, useFragment } from "react-relay";
import { Link } from "react-router-dom";
import { BuildingGroupItemFragment$key } from "./__generated__/BuildingGroupItemFragment.graphql";

const BuildingGroupFragment = graphql`
    fragment BuildingGroupItemFragment on BuildingGroup {
        id
        name
        buildings {
            title
            databaseId
            id
        }
        databaseId
    }
`;

type BuildingItemProps = {
    buildingGroupFromParent: BuildingGroupItemFragment$key;
};

function BuildingGroupItem({ buildingGroupFromParent }: BuildingItemProps) {
    const buildingGroup = useFragment(
        BuildingGroupFragment,
        buildingGroupFromParent
    );
    return (
        <Group style={{flexDirection: "column"}} className="buildingListLink buildingListItem">
            <Link
                style={{flexGrow: 2}}
                to={`/buildingGroup/${buildingGroup.databaseId}/${encodeURI(
                    buildingGroup.name
                )}`}
            >
                <h2 style={{background: "innital"}}>{buildingGroup.name}</h2>
            </Link>
            <Group>
                Buildings:
                {buildingGroup.buildings.map((building) => {
                    return <Link key={building.id} to={`/building/${building.databaseId}/viewer`}>{building.title}</Link>;
                })}
            </Group>
        </Group>
    );
}

export default BuildingGroupItem;

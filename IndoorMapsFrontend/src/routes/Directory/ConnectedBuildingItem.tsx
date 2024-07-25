import { Link } from "react-router-dom";
import { graphql, useFragment } from "react-relay";
import { ConnectedBuildingItemFragment$key } from "./__generated__/ConnectedBuildingItemFragment.graphql";
import { Group, Select, Tooltip } from "@mantine/core";

const ConnectedBuildingFragment = graphql`
    fragment ConnectedBuildingItemFragment on BuildingWithPerms {
        id
        editorLevel
        building {
            id
            databaseId
            title
            address
            buildingGroup {
                id
                databaseId
                name
            }
        }
    }
`;

type ConnectedBuildingItemProps = {
    buildingWithPermsFromParent: ConnectedBuildingItemFragment$key,
    selectOptions: { value: string, label: string }[];
}

function ConnectedBuildingItem({ selectOptions, buildingWithPermsFromParent }: ConnectedBuildingItemProps) {
    const buildingWithPerms = useFragment(
        ConnectedBuildingFragment,
        buildingWithPermsFromParent,
    );
    const buildingGroup = buildingWithPerms.building.buildingGroup;
    if (buildingGroup && selectOptions.findIndex((option) => option.value === buildingGroup.databaseId.toString()) == -1) {
        selectOptions.push({
            value: buildingGroup.databaseId.toString(),
            label: buildingGroup.name,
        });
    }
    const handleChangeSelectedBuildingGroup = (value: string | null) => {
        console.log(value);
    }

    return (
        <Group className="buildingListLink buildingListItem">
            <Link to={`/building/${buildingWithPerms.building.databaseId}/editor`}>
                <h2>{buildingWithPerms.building.title}</h2>
                <p>{buildingWithPerms.building.address}</p>
            </Link>
            <p style={{ marginLeft: "auto" }}>you are: {buildingWithPerms.editorLevel}</p>
            <Tooltip label="Buildings in the same group will apear on eachother's map">
                <Select
                    placeholder="Choose a group"
                    defaultValue={buildingWithPerms.building.buildingGroup?.name}
                    allowDeselect
                    data={selectOptions}
                    onChange={handleChangeSelectedBuildingGroup}
                />
            </Tooltip>
        </Group>
    )
}

export default ConnectedBuildingItem;

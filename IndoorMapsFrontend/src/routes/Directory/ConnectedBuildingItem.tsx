import { Link } from "react-router-dom";
import { graphql, useFragment, useMutation } from "react-relay";
import { ConnectedBuildingItemFragment$key } from "./__generated__/ConnectedBuildingItemFragment.graphql";
import { Group, Select, Tooltip } from "@mantine/core";
import { ConnectedBuildingItemMutation, ConnectedBuildingItemMutation$variables } from "./__generated__/ConnectedBuildingItemMutation.graphql";
import FormErrorNotification from "../../components/forms/FormErrorNotification";
import { useState } from "react";

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
    const [formError, setFormError] = useState<string | null>(null);
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
    const [commit] = useMutation<ConnectedBuildingItemMutation>(graphql`
        mutation ConnectedBuildingItemMutation($data: ConnectBuildingToBuildingGroup!){
            addBuildingToBuildingGroup(data: $data) {
                id
            }
        }
    `);

    const handleChangeSelectedBuildingGroup = (value: string | null) => {
        const data: ConnectedBuildingItemMutation$variables["data"] = {
            id: buildingWithPerms.building.databaseId,
            buildingGroupDatabaseId: null,
        }
        if (value) {
            data.buildingGroupDatabaseId = parseInt(value)
        }
        try {
            commit({
                variables: {
                    data
                },
                onError(error) {
                    setFormError(error.message);
                },
            });
        } catch (error) {
            const errorMessage = (error as Error).message;
            setFormError(errorMessage);
        }
    }

    return (
        <Group className="buildingListLink buildingListItem">
            <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
            <Link to={`/building/${buildingWithPerms.building.databaseId}/editor`}>
                <h2>{buildingWithPerms.building.title}</h2>
                <p>{buildingWithPerms.building.address}</p>
            </Link>
            <p style={{ marginLeft: "auto" }}>you are: {buildingWithPerms.editorLevel}</p>
            <Tooltip label="Buildings in the same group will apear on eachother's map">
                <Select
                    placeholder="Choose a group"
                    defaultValue={buildingGroup?.databaseId.toString()}
                    allowDeselect
                    data={selectOptions}
                    onChange={handleChangeSelectedBuildingGroup}
                />
            </Tooltip>
        </Group>
    )
}

export default ConnectedBuildingItem;

import { Group, TextInput, rem } from "@mantine/core";
import BuildingGroupItem from "./BuildingGroupItem";
import { IconSearch } from '@tabler/icons-react';
import { graphql, useRefetchableFragment } from "react-relay";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "../../utils/hooks";
import { ListOfBuildingGroupsFragment$key } from "./__generated__/ListOfBuildingGroupsFragment.graphql";

const debounceTime = 200;

const AllBuildingGroupsFragment = graphql`
  fragment ListOfBuildingGroupsFragment on Query
    @refetchable(queryName: "allBuildingGroupsRefetchQuerry") {
        allBuildingGroups(data: $buildingSearchInput) {
            ...BuildingGroupItemFragment
        }
    }
`;

type ListOfBuildingsProps = {
    graphQLData: ListOfBuildingGroupsFragment$key
}

function ListOfBuildingGroups({ graphQLData }: ListOfBuildingsProps) {
    const [data, refetch] = useRefetchableFragment(AllBuildingGroupsFragment, graphQLData);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, "", debounceTime);
    const [, startTransition] = useTransition();
    const buildingGroups = data.allBuildingGroups;
    // The key is the index and not the relay building id
    // Because the building data is not visible to this component (as it does not call useFragment)
    const buildingListElements = buildingGroups.map((buildingGroup, i) => {
        return (<BuildingGroupItem key={i} buildingGroupFromParent={buildingGroup} />)
    })

    const iconSearch = <IconSearch style={{ width: rem(16), height: rem(16) }} />

    useEffect(() => {
        startTransition(() => {
            refetch({ buildingSearchInput: {searchQuery: debouncedSearchQuery} }, { fetchPolicy: 'store-or-network' })
        });
    }, [debouncedSearchQuery])

    return (
        <div className="buildingsTitle">
            <Group justify="space-between">
                <h2>Building Groups:</h2>
                <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={iconSearch}
                    label="Building Group Search"
                    placeholder="search .."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                />
            </Group>
            <div className="buildingsContainer">
                {buildingListElements}
            </div>
        </div>

    );
}

export default ListOfBuildingGroups;

import { Group, TextInput, rem } from "@mantine/core";
import BuildingItem from "./BuildingItem";
import { IconSearch } from '@tabler/icons-react';
import { graphql, useRefetchableFragment } from "react-relay";
import { ListOfBuildingsFragment$key } from "./__generated__/ListOfBuildingsFragment.graphql";
import { useEffect, useState, useTransition } from "react";
import { useDebounce } from "../../../utils/hooks";

const debounceTime = 200;

const AllBuildingsFragment = graphql`
  fragment ListOfBuildingsFragment on Query
    @refetchable(queryName: "allBuildingsRefetchQuerry") {
        allBuildings(data: $buildingSearchInput) {
            ...BuildingItemFragment
        }
    }
`;

type ListOfBuildingsProps = {
    graphQLData: ListOfBuildingsFragment$key
}

function ListOfBuildings({ graphQLData }: ListOfBuildingsProps) {
    const [data, refetch] = useRefetchableFragment(AllBuildingsFragment, graphQLData);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, "", debounceTime);
    const [_, startTransition] = useTransition();
    const buildings = data.allBuildings;
    // The key is the index and not the relay building id
    // Because the building data is not visible to this component (as it does not call useFragment)
    const buildingListElements = buildings.map((building, i) => {
        return (<BuildingItem key={i} buildingFromParent={building} />)
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
                <h2>Public Buildings:</h2>
                <TextInput
                    leftSectionPointerEvents="none"
                    leftSection={iconSearch}
                    label="Building Search"
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

export default ListOfBuildings;

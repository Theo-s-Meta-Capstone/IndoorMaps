import { em, Group, rem, TextInput } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { graphql, PreloadedQuery, usePreloadedQuery, useRefetchableFragment } from "react-relay";
import { useLoaderData } from "react-router-dom";
import HeaderNav from "../components/pageSections/HeaderNav";
import Footer from "../components/pageSections/Footer";
import { BuildingGroupQuery } from "./__generated__/BuildingGroupQuery.graphql";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState, useTransition } from "react";
import BuildingItem from "./Directory/BuildingItem";
import { useDebounce } from "../utils/hooks";
import { BuildingGroupListOfBuildingsFragment$key } from "./__generated__/BuildingGroupListOfBuildingsFragment.graphql";

export const BuildingGroupPageQuery = graphql`
    query BuildingGroupQuery($data: BuildingGroupUniqueInput!) {
        getUserFromCookie {
            ...ButtonsContainerFragment
        }
        ...BuildingGroupListOfBuildingsFragment
    }
`;

const BuildingGroupFragment = graphql`
  fragment BuildingGroupListOfBuildingsFragment on Query
    @refetchable(queryName: "BuildingGroupListOfBuildingsQuerry") {
        getBuildingGroup(data: $data) {
            name
            databaseId
            buildings {
                id
                title
                ...BuildingItemFragment
            }
        }
    }
`;

const debounceTime = 200;
const iconSearch = <IconSearch style={{ width: rem(16), height: rem(16) }} />;

const Directory = () => {
    
    const queryReference =
        useLoaderData() as PreloadedQuery<BuildingGroupQuery>;
    const data = usePreloadedQuery(BuildingGroupPageQuery, queryReference);
    const { getUserFromCookie } = data;
    const isNotMobile = useMediaQuery(`(min-width: ${em(750)})`);

    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, "", debounceTime);
    const [, startTransition] = useTransition();

    const [buildingGroupData, refetch] = useRefetchableFragment(BuildingGroupFragment, data as BuildingGroupListOfBuildingsFragment$key);
    const buildings = buildingGroupData.getBuildingGroup.buildings;
    const buildingListElements = buildings.map((building, i) => {
        return (<BuildingItem key={i} buildingFromParent={building} />)
    })

    useEffect(() => {
        startTransition(() => {
            refetch({ buildingSearchInput: {searchQuery: debouncedSearchQuery} }, { fetchPolicy: 'store-or-network' })
        });
    }, [debouncedSearchQuery])
    
    return (
        <>
            <HeaderNav
                showDesktopContent={isNotMobile}
                getUserFromCookie={getUserFromCookie}
                pageTitle={buildingGroupData.getBuildingGroup.name}
                currentPage={"/buildingGroup"}
            />
            <main className="directoryMain">
                <div className="buildingsTitle">
                    <Group justify="space-between">
                        <h2>{buildingGroupData.getBuildingGroup.name} Public Buildings:</h2>
                        <TextInput
                            leftSectionPointerEvents="none"
                            leftSection={iconSearch}
                            label="Building Search"
                            placeholder="search .."
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                        />
                    </Group>
                    <div className="buildingsContainer">
                        {buildingListElements}
                    </div>
                </div>
            </main>
            <Footer
                className="notDeviceHeightPage"
                showDesktopContent={isNotMobile}
                getUserFromCookie={getUserFromCookie}
            />
        </>
    );
};

export default Directory;

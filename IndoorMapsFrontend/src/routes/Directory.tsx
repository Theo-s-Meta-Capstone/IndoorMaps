import "./Directory/styles/Directory.css"
import "../components/pageSections/style/FixedFooter.css"
import { PreloadedQuery, graphql, usePreloadedQuery } from "react-relay";
import ListOfBuildings from "./Directory/ListOfBuildings";
import ListOfConnectedBuildings from "./Directory/ListOfConnectedBuildings";
import HeaderNav from "../components/pageSections/HeaderNav";
import { useMediaQuery } from "@mantine/hooks";
import { em } from "@mantine/core";
import Footer from "../components/pageSections/Footer";
import { useLoaderData } from "react-router";
import { DirectoryQuery } from "./__generated__/DirectoryQuery.graphql";

export const DirectoryPageQuery = graphql`
    query DirectoryQuery($autocompleteInput: AutocompleteInput!, $buildingSearchInput: BuildingSearchInput!) {
    getUserFromCookie {
        ...ButtonsContainerFragment,
        ...ListOfConnectedBuildingsUserDataDisplayFragment
    }
    ...AutoCompleteResultsFragment
    ...ListOfBuildingsFragment
}`

const Directory = () => {
    const queryReference = useLoaderData() as PreloadedQuery<DirectoryQuery>;
    const data = usePreloadedQuery(DirectoryPageQuery, queryReference);
    const { getUserFromCookie } = data;
    const isNotMobile = useMediaQuery(`(min-width: ${em(750)})`);

    return (
        <>
            <HeaderNav showDesktopContent={isNotMobile} getUserFromCookie={getUserFromCookie} pageTitle={"Indoor Maps"} currentPage={"/directory"} />
            <main className="directoryMain">
                <ListOfConnectedBuildings getUserFromCookie={getUserFromCookie} getGeocoder={data} />
                <ListOfBuildings graphQLData={data} />
            </main>
            <Footer className="notDeviceHeightPage" showDesktopContent={isNotMobile} getUserFromCookie={getUserFromCookie} />
        </>
    )
}

export default Directory;

import "./Directory/styles/Directory.css"
import "../pageSections/style/FixedFooter.css"
import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import ListOfBuildings from "./Directory/ListOfBuildings";
import { DirectoryQuery } from "./__generated__/DirectoryQuery.graphql";
import ListOfConnectedBuildings from "./Directory/ListOfConnectedBuildings";
import HeaderNav from "../pageSections/HeaderNav";
import { useMediaQuery } from "@mantine/hooks";
import { em } from "@mantine/core";
import Footer from "../pageSections/Footer";

const DirectoryPageQuery = graphql`
    query DirectoryQuery($autocompleteInput: AutocompleteInput!, $buildingSearchInput: BuildingSearchInput!) {
    getUserFromCookie {
        ...ButtonsContainerFragment,
        ...ListOfConnectedBuildingsUserDataDisplayFragment
    }
    ...AutoCompleteResultsFragment
    ...ListOfBuildingsFragment
}`

const Directory = () => {
    const [
        queryReference,
        loadQuery,
    ] = useQueryLoader<DirectoryQuery>(
        DirectoryPageQuery,
    );

    // See ./Root.tsx line 24 for explanation of this useEffect
    useEffect(() => {
        loadQuery({
            autocompleteInput: {
                p: null,
            },
            buildingSearchInput: {}
        });
    }, []);

    if (queryReference == null) {
        return <div>Waiting for useEffect</div>
    }

    return (
        <Suspense fallback="Loading GraphQL">
            <DirectoryBodyContainer queryReference={queryReference} />
        </Suspense>

    )
}

type DirectoryBodyContainerProps = {
    queryReference: PreloadedQuery<DirectoryQuery>
}

function DirectoryBodyContainer({ queryReference }: DirectoryBodyContainerProps) {
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
            <Footer className="notFlexboxPage" showDesktopContent={isNotMobile} getUserFromCookie={getUserFromCookie} />
        </>
    )
}

export default Directory;

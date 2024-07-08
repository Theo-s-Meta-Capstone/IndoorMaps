import "./Directory/styles/Directory.css"
import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import ListOfBuildings from "./Directory/ListOfBuildings";
import { DirectoryQuery } from "./__generated__/DirectoryQuery.graphql";
import ListOfConnectedBuildings from "./Directory/ListOfConnectedBuildings";
import HeaderNav from "../pageSections/HeaderNav";

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
    return (
        <>
            <HeaderNav getUserFromCookie={getUserFromCookie} pageTitle={"Indoor Maps"} currentPage={"/directory"}/>
            <ListOfConnectedBuildings getUserFromCookie={getUserFromCookie} getGeocoder={data} />
            <ListOfBuildings graphQLData={data} />
        </>
    )
}

export default Directory;

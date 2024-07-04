import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import ListOfBuildings from "./Directory/ListOfBuildings";
import ButtonsContainer from "../pageSections/ButtonsContainer";
import UserDataDisplay from "../pageSections/UserDataDisplay";
import { DirectoryQuery } from "./__generated__/DirectoryQuery.graphql";
import ListOfConnectedBuildings from "./Directory/ListOfConnectedBuildings";

const DirectoryPageQuery = graphql`
    query DirectoryQuery($data: AutocompleteInput!) {
    allBuildings {
        id
        ...BuildingItemFragment
    }
    getUserFromCookie {
        ...ButtonsContainerFragment,
        ...UserDataDisplayFragment,
        ...ListOfConnectedBuildingsUserDataDisplayFragment
    }
    ...AutoCompleteResultsFragment
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
            data: {
                p: null,
            }
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
    const { getUserFromCookie, allBuildings } = data;
    return (
        <>
            <ButtonsContainer getUserFromCookie={getUserFromCookie} />
            <UserDataDisplay getUserFromCookie={getUserFromCookie} />
            <ListOfConnectedBuildings getUserFromCookie={getUserFromCookie} getGeocoder={data} />
            <ListOfBuildings buildings={allBuildings} />
        </>
    )
}

export default Directory;

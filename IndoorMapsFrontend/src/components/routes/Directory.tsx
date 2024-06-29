import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import ListOfBuildings from "./Directory/ListOfBuildings";
import ButtonsContainer from "../pageSections/ButtonsContainer";
import UserDataDisplay from "./Directory/UserDataDisplay";
import { DirectoryQuery } from "./__generated__/DirectoryQuery.graphql";

const DirectoryPageQuery = graphql`
    query DirectoryQuery {
    allBuildings {
        ...BuildingItemFragment
    }
    getUserFromCookie {
        ...ButtonsContainerFragment,
        ...UserDataDisplayFragment
    }
}`

const Directory = () => {
    const [
        queryReference,
        loadQuery,
    ] = useQueryLoader<DirectoryQuery>(
        DirectoryPageQuery,
    );

    useEffect(() => {
        loadQuery({});
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
    return (
        <>
            <ButtonsContainer getUserFromCookie={data.getUserFromCookie} />
            <UserDataDisplay getUserFromCookie={data.getUserFromCookie} />
            <ListOfBuildings buildings={data.allBuildings} />
        </>
    )
}

export default Directory;

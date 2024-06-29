import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import ListOfBuildings from "./Directory/ListOfBuildings";
import ButtonsContainer from "../pageSections/ButtonsContainer";
import UserDataDisplay from "./Directory/UserDataDisplay";
import { DirectoryQuery } from "./__generated__/DirectoryQuery.graphql";

type Props = {

}
const DirectoryQuery = graphql`
    query DirectoryQuery {
    allBuildings {
        ...BuildingItemFragment
    }
    getUserFromCookie {
        ...ButtonsContainerFragment,
        ...UserDataDisplayFragment
    }
}
`

const Directory = ({ }: Props) => {
    const [
        queryReference,
        loadQuery,
    ] = useQueryLoader<DirectoryQuery>(
        DirectoryQuery,
    );

    useEffect(() => {
        loadQuery({});
    }, []);

    if (queryReference == null) {
        return <div>Loading...</div>
    }

    return (
        <Suspense fallback="Loading">
            <DirectoryBodyContainer queryReference={queryReference} />
        </Suspense>

    )
}

type DirectoryBodyContainerProps = {
    queryReference: PreloadedQuery<DirectoryQuery>
}

function DirectoryBodyContainer({ queryReference }: DirectoryBodyContainerProps) {
    const data = usePreloadedQuery(DirectoryQuery, queryReference);
    return (
        <>
            <ButtonsContainer getUserFromCookie={data.getUserFromCookie} />
            <UserDataDisplay getUserFromCookie={data.getUserFromCookie} />
            <ListOfBuildings buildings={data.allBuildings} />
        </>
    )
}

export default Directory;

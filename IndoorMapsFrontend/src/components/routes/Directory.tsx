import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import type { DirectoryGetAllBuildingsQuery } from "./__generated__/DirectoryGetAllBuildingsQuery.graphql";
import ListOfBuildings from "./Directory/ListOfBuildings";
import ButtonsContainer from "../pageSections/ButtonsContainer";
import UserDataDisplay from "./Directory/UserDataDisplay";

type Props = {

}
const GetAllBuildings = graphql`
    query DirectoryGetAllBuildingsQuery {
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
    ] = useQueryLoader<DirectoryGetAllBuildingsQuery>(
        GetAllBuildings,
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
    queryReference: PreloadedQuery<DirectoryGetAllBuildingsQuery>
}

function DirectoryBodyContainer({ queryReference }: DirectoryBodyContainerProps) {
    const data = usePreloadedQuery(GetAllBuildings, queryReference);
    return (
        <>
            <ButtonsContainer getUserFromCookie={data.getUserFromCookie} />
            <UserDataDisplay getUserFromCookie={data.getUserFromCookie} />
            <ListOfBuildings buildings={data.allBuildings} />
        </>
    )
}

export default Directory;

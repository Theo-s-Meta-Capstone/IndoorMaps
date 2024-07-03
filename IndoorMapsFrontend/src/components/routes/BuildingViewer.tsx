import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import { Link, useParams } from "react-router-dom";
import ButtonsContainer from "../pageSections/ButtonsContainer";
import UserDataDisplay from "../pageSections/UserDataDisplay";
import { BuildingViewerQuery } from "./__generated__/BuildingViewerQuery.graphql";

const BuildingViewerPageQuery = graphql`
    query BuildingViewerQuery {
    getUserFromCookie {
        ...ButtonsContainerFragment,
        ...UserDataDisplayFragment
    }
}`

const BuildingViewer = () => {
    const { buildingId } = useParams();

    const [
        queryReference,
        loadQuery,
    ] = useQueryLoader<BuildingViewerQuery>(
        BuildingViewerPageQuery,
    );

    useEffect(() => {
        loadQuery({});
    }, []);

    return (
        <div>
            <h1>Viewing building #{buildingId}</h1>
            <Link to="/directory">Directory</Link>
            {queryReference == null ? <div>Waiting for useEffect</div> :
                <Suspense fallback="Loading GraphQL">
                    <BuildingViewerBodyContainer queryReference={queryReference} />
                </Suspense>
            }
            <p>Created by <a href="https://theoh.dev">Theo Halpern</a></p>
        </div>
    )
}

type BuildingViewerBodyContainerProps = {
    queryReference: PreloadedQuery<BuildingViewerQuery>
}

function BuildingViewerBodyContainer({ queryReference }: BuildingViewerBodyContainerProps) {
    const {getUserFromCookie} = usePreloadedQuery(BuildingViewerPageQuery, queryReference);
    return (
        <>
            <ButtonsContainer getUserFromCookie={getUserFromCookie} />
            <UserDataDisplay getUserFromCookie={getUserFromCookie} />
        </>
    )
}

export default BuildingViewer;

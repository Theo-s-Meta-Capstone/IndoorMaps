import "./BuildingViewer/BuildingViewer.css"
import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import { Link, useParams } from "react-router-dom";
import ButtonsContainer from "../pageSections/ButtonsContainer";
import UserDataDisplay from "../pageSections/UserDataDisplay";
import { BuildingViewerQuery } from "./__generated__/BuildingViewerQuery.graphql";
import BuildingViewerBody from "./BuildingViewer/BuildingViewerBody";

const BuildingViewerPageQuery = graphql`
    query BuildingViewerQuery($data: BuildingUniqueInput!) {
    getUserFromCookie {
        ...ButtonsContainerFragment,
        ...UserDataDisplayFragment
    }
    getBuilding(data: $data) {
        title
        ...BuildingViewerBodyFragment
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

    // See ./Root.tsx line 24 for explanation of this useEffect
    // TODO: load the correct building based off the params
    useEffect(() => {
        if (buildingId == null) {
            return;
        }
        loadQuery({
            "data": {
                id: parseInt(buildingId)
            }
        });
    }, []);

    return (
        <div>
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
    const {getUserFromCookie, getBuilding} = usePreloadedQuery(BuildingViewerPageQuery, queryReference);
    return (
        <>
            <h1>{getBuilding.title}</h1>
            <Link to="/directory">Directory</Link>
            <ButtonsContainer getUserFromCookie={getUserFromCookie} />
            <UserDataDisplay getUserFromCookie={getUserFromCookie} />
            <BuildingViewerBody buildingFromParent={getBuilding} />
        </>
    )
}

export default BuildingViewer;

import "./BuildingViewer/BuildingViewer.css"
import { Suspense, useEffect, useMemo } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader, useSubscription } from "react-relay";
import { useParams } from "react-router-dom";
import { BuildingViewerQuery } from "./__generated__/BuildingViewerQuery.graphql";
import BuildingViewerBody from "./BuildingViewer/BuildingViewerBody";
import HeaderNav from "../pageSections/HeaderNav";
import { BuildingViewerSubscription } from "./__generated__/BuildingViewerSubscription.graphql";

const BuildingViewerPageQuery = graphql`
    query BuildingViewerQuery($data: BuildingUniqueInput!) {
    getUserFromCookie {
        ...ButtonsContainerFragment
        }
    getBuilding(data: $data) {
        title
        ...BuildingViewerBodyFragment
    }
}`

const subscription = graphql`
  subscription BuildingViewerSubscription {
  newLiveLocation(data: {id: 1}) {
    id
    latitude
    longitude
    name
    message
  }
}
`;

const BuildingViewer = () => {
    const { buildingId } = useParams();

    const [
        queryReference,
        loadQuery,
    ] = useQueryLoader<BuildingViewerQuery>(
        BuildingViewerPageQuery,
    );

    // IMPORTANT: your config should be memoized.
    // Otherwise, useSubscription will re-render too frequently.
    const config = useMemo(() => ({
        variables: {},
        subscription,
        // a callback that is executed when a subscription payload is received
        onNext: (res: any) => {
            // In res, we get the updated reference that, we can use in
            // GroupLessonsPage to read updated data from relay store.
            console.log(res); // here we will get the fragment Reference
        },
        // a callback that is executed when the subscription errors.
        onError: (err: any) => {
            console.error(err)
        },
        // a callback that is executed when the server ends the subscription
        onCompleted: () => { },
    }), [subscription]);

    useSubscription<BuildingViewerSubscription>(config);

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
    const { getUserFromCookie, getBuilding } = usePreloadedQuery(BuildingViewerPageQuery, queryReference);
    return (
        <>
            <HeaderNav getUserFromCookie={getUserFromCookie} pageTitle={getBuilding.title} currentPage={"/"} />
            <BuildingViewerBody buildingFromParent={getBuilding} />
        </>
    )
}

export default BuildingViewer;

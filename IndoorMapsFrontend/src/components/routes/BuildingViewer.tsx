import "./BuildingViewer/BuildingViewer.css"
import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import { useParams } from "react-router-dom";
import { BuildingViewerQuery } from "./__generated__/BuildingViewerQuery.graphql";
import BuildingViewerBody from "./BuildingViewer/BuildingViewerBody";
import HeaderNav from "../pageSections/HeaderNav";
import { useBooleanState } from "../../utils/hooks";
import { Button } from "@mantine/core";
import ShareLocationModal from "./BuildingViewer/ShareLocationModal";

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
        <div className="everythingContainer">
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
    const [isShareLiveLocationOpen, handleCloseShareLiveLocation, handleOpenShareLiveLocation] = useBooleanState(false);

    return (
        <>
            <HeaderNav getUserFromCookie={getUserFromCookie} pageTitle={getBuilding.title} currentPage={"/"}>
                <Button onClick={handleOpenShareLiveLocation}>
                    Share Location Live
                </Button>
                <ShareLocationModal isOpen={isShareLiveLocationOpen} closeModal={handleCloseShareLiveLocation} />
            </HeaderNav>
            <BuildingViewerBody buildingFromParent={getBuilding} />
        </>
    )
}

export default BuildingViewer;

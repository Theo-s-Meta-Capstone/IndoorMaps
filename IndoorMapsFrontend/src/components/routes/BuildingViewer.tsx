import "./BuildingViewer/BuildingViewer.css"
import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import { useParams } from "react-router-dom";
import { BuildingViewerQuery } from "./__generated__/BuildingViewerQuery.graphql";
import BuildingViewerBody from "./BuildingViewer/BuildingViewerBody";
import HeaderNav from "../pageSections/HeaderNav";
import { useBooleanState } from "../../utils/hooks";
import { Button, em } from "@mantine/core";
import ShareLocationModal from "./BuildingViewer/ShareLocationModal";
import Footer from "../pageSections/Footer";
import { useMediaQuery } from "@mantine/hooks";

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
        <div className="mainVerticalFlexContainer">
            {queryReference == null ? <div>Waiting for useEffect</div> :
                <Suspense fallback="Loading GraphQL">
                    <BuildingViewerBodyContainer queryReference={queryReference} />
                </Suspense>
            }
        </div>
    )
}

type BuildingViewerBodyContainerProps = {
    queryReference: PreloadedQuery<BuildingViewerQuery>
}

function BuildingViewerBodyContainer({ queryReference }: BuildingViewerBodyContainerProps) {
    const { getUserFromCookie, getBuilding } = usePreloadedQuery(BuildingViewerPageQuery, queryReference);
    const [isShareLiveLocationOpen, handleCloseShareLiveLocation, handleOpenShareLiveLocation] = useBooleanState(false);
    const isNotMobile = useMediaQuery(`(min-width: ${em(750)})`);

    return (
        <>
            <HeaderNav getUserFromCookie={getUserFromCookie} pageTitle={getBuilding.title} currentPage={"/"} showDesktopContent={isNotMobile}>
                <Button onClick={handleOpenShareLiveLocation}>
                    Share Location Live
                </Button>
                <ShareLocationModal isOpen={isShareLiveLocationOpen} closeModal={handleCloseShareLiveLocation} />
            </HeaderNav>
            <BuildingViewerBody buildingFromParent={getBuilding} />
            <Footer getUserFromCookie={getUserFromCookie} showDesktopContent={isNotMobile} />
        </>
    )
}

export default BuildingViewer;

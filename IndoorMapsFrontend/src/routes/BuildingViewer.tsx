import "./BuildingViewer/styles/BuildingViewer.css"
import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BuildingViewerQuery } from "./__generated__/BuildingViewerQuery.graphql";
import BuildingViewerBody from "./BuildingViewer/BuildingViewerBody";
import HeaderNav from "../components/pageSections/HeaderNav";
import { useBooleanState } from "../utils/hooks";
import { Button, em } from "@mantine/core";
import ShareLocationModal from "./BuildingViewer/ShareLocationModal";
import Footer from "../components/pageSections/Footer";
import { useClipboard, useMediaQuery } from "@mantine/hooks";
import LoadingPage from "../components/pageSections/LoadingPage";

const BuildingViewerPageQuery = graphql`
    query BuildingViewerQuery($data: BuildingUniqueInput!) {
    getUserFromCookie {
        ...ButtonsContainerFragment
    }
    getBuilding(data: $data) {
        title
        databaseId
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
            {queryReference == null ? <LoadingPage /> :
                <Suspense fallback={<LoadingPage />}>
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
    const [searchParams,] = useSearchParams();
    const clipboard = useClipboard();
    const navigate = useNavigate();

    return (
        <>
            <HeaderNav getUserFromCookie={getUserFromCookie} pageTitle={getBuilding.title} currentPage={"/"} showDesktopContent={isNotMobile}>
                <Button color="dark-blue" onClick={handleOpenShareLiveLocation}>
                    {isNotMobile ? "Share Location Live" : <img alt={"share live location"} src={"/shareLiveLocation.svg"} />}
                </Button>
                <ShareLocationModal isOpen={isShareLiveLocationOpen} closeModal={handleCloseShareLiveLocation} />
                {searchParams.get("preview") !== null && searchParams.get("preview") === "true" ?
                    <>
                        <Button color="dark-blue" onClick={() => navigate(`/building/${getBuilding.databaseId}/editor`)}>
                            Back To Editor
                        </Button>
                        <Button color="dark-blue" onClick={() => clipboard.copy(window.location.origin + `/building/${getBuilding.databaseId}/viewer`)}>
                            {clipboard.copied ? "Link Copied" : "Share"}
                        </Button>
                    </>
                    : null
                }
            </HeaderNav>
            <BuildingViewerBody buildingFromParent={getBuilding} />
            <Footer getUserFromCookie={getUserFromCookie} showDesktopContent={isNotMobile} />
        </>
    )
}

export default BuildingViewer;

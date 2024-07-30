import "./BuildingViewer/styles/BuildingViewer.css"
import { PreloadedQuery, graphql, usePreloadedQuery } from "react-relay";
import { useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import BuildingViewerBody from "./BuildingViewer/BuildingViewerBody";
import HeaderNav from "../components/pageSections/HeaderNav";
import { useBooleanState } from "../utils/hooks";
import { Button, em } from "@mantine/core";
import ShareLocationModal from "./BuildingViewer/ShareLocationModal";
import Footer from "../components/pageSections/Footer";
import { useClipboard, useMediaQuery } from "@mantine/hooks";
import { BuildingViewerQuery } from "./__generated__/BuildingViewerQuery.graphql";

export const BuildingViewerPageQuery = graphql`
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
    const queryReference = useLoaderData() as PreloadedQuery<BuildingViewerQuery>;
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

import { lazy } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery } from "react-relay";
import { useLoaderData, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BuildingEditorQuery } from "./__generated__/BuildingEditorQuery.graphql";
import HeaderNav from "../components/pageSections/HeaderNav";
import { Button, em } from "@mantine/core";
import { useClipboard, useMediaQuery } from "@mantine/hooks";
import { useBooleanState } from "../utils/hooks";
import InviteEditorsModal from "./BuildingEditor/InviteEditorsModal";
import Footer from "../components/pageSections/Footer";
import EditBuildingModal from "../components/forms/EditBuildingModal";

const BuildingEditorBody = lazy(() => import("./BuildingEditor/BuildingEditorBody"));

export const BuildingEditorPageQuery = graphql`
    query BuildingEditorQuery($data: BuildingUniqueInput!, $autocompleteInput: AutocompleteInput!, ) {
    getUserFromCookie {
        ...ButtonsContainerFragment,
    }
    getBuilding(data: $data) {
        title
        ...BuildingEditorBodyFragment
        ...EditBuildingModalGetDataFragment
    }
    ...AutoCompleteResultsFragment
}`

const BuildingEditor = () => {
    const queryReference = useLoaderData() as PreloadedQuery<BuildingEditorQuery>;
    const [isInviteEditorOpen, handleCloseInviteEditor, handleOpenInviteEditor] = useBooleanState(false);
    const [isEditBuildingDetailsOpen, handleCloseEditBuildingDetails, handleOpenEditBuildingDetails] = useBooleanState(false);
    const data = usePreloadedQuery(BuildingEditorPageQuery, queryReference);
    const { getUserFromCookie, getBuilding } = data;
    const clipboard = useClipboard();
    const { buildingId } = useParams();
    const isNotMobile = useMediaQuery(`(min-width: ${em(750)})`);
    const navigate = useNavigate();
    const [searchParams,] = useSearchParams();

    return (
        <>
            <HeaderNav getUserFromCookie={getUserFromCookie} pageTitle={`Building Editor - ${getBuilding.title}`} currentPage={"/directory"} showDesktopContent={isNotMobile}>
                <Button color="dark-blue" onClick={() => clipboard.copy(window.location.origin + `/building/${buildingId}/viewer`)}>
                    {clipboard.copied ? "Link Copied" : "Share"}
                </Button>
                <Button color="dark-blue" onClick={() => {
                    const floor = searchParams.get("floor")
                    const perviewLink = floor == null ? `/building/${buildingId}/viewer?preview=true` : `/building/${buildingId}/viewer?preview=true&floor=${floor}`;
                    navigate(perviewLink)
                }}>
                    Preview
                </Button>
                <Button color="dark-blue" onClick={handleOpenInviteEditor}>
                    Invite Editors
                </Button>
                <InviteEditorsModal isOpen={isInviteEditorOpen} closeModal={handleCloseInviteEditor} />
                <Button color="dark-blue" onClick={handleOpenEditBuildingDetails}>
                    Edit Building Details
                </Button>
                <EditBuildingModal isOpen={isEditBuildingDetailsOpen} closeModal={handleCloseEditBuildingDetails} getGeocoder={data} buildingFromParent={getBuilding} />
            </HeaderNav>
            <BuildingEditorBody buildingFromParent={getBuilding} />
            <Footer getUserFromCookie={getUserFromCookie} showDesktopContent={isNotMobile} />
        </>
    )
}

export default BuildingEditor;

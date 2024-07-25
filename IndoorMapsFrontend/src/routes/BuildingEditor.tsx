import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BuildingEditorQuery } from "./__generated__/BuildingEditorQuery.graphql";
import BuildingEditorBody from "./BuildingEditor/BuildingEditorBody";
import HeaderNav from "../components/pageSections/HeaderNav";
import { Button, em } from "@mantine/core";
import { useClipboard, useMediaQuery } from "@mantine/hooks";
import { useBooleanState } from "../utils/hooks";
import InviteEditorsModal from "./BuildingEditor/InviteEditorsModal";
import Footer from "../components/pageSections/Footer";
import EditBuildingModal from "../components/forms/EditBuildingModal";
import LoadingPage from "../components/pageSections/LoadingPage";

const BuildingEditorPageQuery = graphql`
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
    const { buildingId } = useParams();

    const [
        queryReference,
        loadQuery,
    ] = useQueryLoader<BuildingEditorQuery>(
        BuildingEditorPageQuery,
    );

    // See ./Root.tsx line 24 for explanation of this useEffect
    useEffect(() => {
        if (buildingId == null) {
            return;
        }
        loadQuery({
            autocompleteInput: {
                p: null,
            },
            data: {
                id: parseInt(buildingId)
            }
        });
    }, []);

    return (
        <div className="mainVerticalFlexContainer">
            {queryReference == null ? <LoadingPage /> :
                <Suspense fallback={<LoadingPage />}>
                    <BuildingEditorBodyContainer queryReference={queryReference} />
                </Suspense>
            }
        </div>
    )
}

type BuildingEditorBodyContainerProps = {
    queryReference: PreloadedQuery<BuildingEditorQuery>
}

function BuildingEditorBodyContainer({ queryReference }: BuildingEditorBodyContainerProps) {
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

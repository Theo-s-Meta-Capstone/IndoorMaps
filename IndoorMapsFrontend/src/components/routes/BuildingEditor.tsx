import { Suspense, useEffect } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader } from "react-relay";
import { useParams } from "react-router-dom";
import { BuildingEditorQuery } from "./__generated__/BuildingEditorQuery.graphql";
import BuildingEditorBody from "./BuildingEditor/BuildingEditorBody";
import HeaderNav from "../pageSections/HeaderNav";
import { Button, em } from "@mantine/core";
import { useClipboard, useMediaQuery } from "@mantine/hooks";
import { useBooleanState } from "../../utils/hooks";
import InviteEditorsModal from "./BuildingEditor/InviteEditorsModal";
import Footer from "../pageSections/Footer";

const BuildingEditorPageQuery = graphql`
    query BuildingEditorQuery($data: BuildingUniqueInput!) {
    getUserFromCookie {
        ...ButtonsContainerFragment,
    }
    getBuilding(data: $data) {
        title
        ...BuildingEditorBodyFragment
    }
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
            "data": {
                id: parseInt(buildingId)
            }
        });
    }, []);

    return (
        <div className="everythingContainer">
            {queryReference == null ? <div>Waiting for useEffect</div> :
                <Suspense fallback="Loading GraphQL">
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
    const { getUserFromCookie, getBuilding } = usePreloadedQuery(BuildingEditorPageQuery, queryReference);
    const clipboard = useClipboard();
    const { buildingId } = useParams();
    const isNotMobile = useMediaQuery(`(min-width: ${em(750)})`);

    return (
        <>
            <HeaderNav getUserFromCookie={getUserFromCookie} pageTitle={`Building Editor - ${getBuilding.title}`} currentPage={"/directory"} showDesktopContent={isNotMobile}>
                <Button onClick={() => clipboard.copy(window.location.origin + `/building/${buildingId}/viewer`)}>
                    {clipboard.copied ? "Link Copied" : "Share"}
                </Button>
                <Button onClick={handleOpenInviteEditor}>
                    Invite Editors
                </Button>
                <InviteEditorsModal isOpen={isInviteEditorOpen} closeModal={handleCloseInviteEditor} />
            </HeaderNav>
            <BuildingEditorBody buildingFromParent={getBuilding} />
            <Footer getUserFromCookie={getUserFromCookie} showDesktopContent={isNotMobile}/>
        </>
    )
}

export default BuildingEditor;

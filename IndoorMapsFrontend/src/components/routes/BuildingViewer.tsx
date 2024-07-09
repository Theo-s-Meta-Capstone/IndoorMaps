import "./BuildingViewer/BuildingViewer.css"
import { Suspense, useEffect, useMemo, useState } from "react";
import { PreloadedQuery, graphql, usePreloadedQuery, useQueryLoader, useSubscription } from "react-relay";
import { useParams } from "react-router-dom";
import { BuildingViewerQuery } from "./__generated__/BuildingViewerQuery.graphql";
import BuildingViewerBody from "./BuildingViewer/BuildingViewerBody";
import HeaderNav from "../pageSections/HeaderNav";
import { BuildingViewerSubscription, BuildingViewerSubscription$data } from "./__generated__/BuildingViewerSubscription.graphql";
import { useBooleanState } from "../../utils/hooks";
import { Button } from "@mantine/core";
import ShareLocationModal from "./BuildingViewer/ShareLocationModal";
import { LiveLocationMarker } from "../../utils/types";

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
  subscription BuildingViewerSubscription($data: BuildingUniqueInput!) {
  newLiveLocation(data: $data) {
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
    const [isShareLiveLocationOpen, handleCloseShareLiveLocation, handleOpenShareLiveLocation] = useBooleanState(false);
    const [locationMarkers, setLocationMarkers] = useState<LiveLocationMarker[]>([]);
    const { buildingId } = useParams();

    // If a item exists in locationMarkers with the same id, that item is replaced with the new item
    // otherwise the new item is added at the end
    const handleSetLocationMarkers = (newLocation: LiveLocationMarker) => {
        setLocationMarkers(prev => {
            let changeFound = false
            let newVal = prev.map((oldVal) => {
                if(oldVal.id == newLocation.id){
                    changeFound = true;
                    return newLocation;
                }
                return oldVal;
            })
            if(!changeFound){
                newVal.push(newLocation);
            }
            return newVal
        })
    }

    const config = useMemo(() => ({
        variables: {
            "data": {
                // setting this to -1 if null is pretty safe becuase it just means that on the backend it will
                // only recieve inputs from a user at a building with id -1 which should not happen
                "id": parseInt(buildingId ?? "-1")
            }
        },
        subscription,
        onNext: (response: BuildingViewerSubscription$data | null | undefined) => {
            if(!response){
                return;
            }
            handleSetLocationMarkers(response.newLiveLocation)
        },
        onError: (err: any) => {
            console.error(err)
        },
        onCompleted: () => { },
    }), [subscription]);

    useSubscription<BuildingViewerSubscription>(config);

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

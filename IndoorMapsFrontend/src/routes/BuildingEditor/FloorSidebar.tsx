import { graphql, useFragment, useMutation } from "react-relay";
import { FloorSidebarBodyFragment$key } from "./__generated__/FloorSidebarBodyFragment.graphql";
import FloorListItem from "./FloorListItem";
import { Button, ScrollArea, Tooltip } from "@mantine/core";
import FormErrorNotification from "../../components/forms/FormErrorNotification";
import CreateFloorModal from "../../components/forms/CreateFloorModal";
import { useEffect, useMemo, useState } from "react";
import { useBooleanState } from "../../utils/hooks";
import { FloorSidebarFloorMutation, FloorSidebarFloorMutation$variables } from "./__generated__/FloorSidebarFloorMutation.graphql";
import * as L from "leaflet";
import { removeAllLayersFromLayerGroup } from "../../utils/utils";
import GuideImage from "./GuideImage";

const FloorSidebarFragment = graphql`
  fragment FloorSidebarBodyFragment on Building
  {
    id
    databaseId
    startPos {
      lat
      lon
    }
    floors {
      id
      databaseId
      title
      shape
      ...FloorListItemFragment
      ...GuideImageFragment
    }
  }
`;

type Props = {
    buildingFromParent: FloorSidebarBodyFragment$key;
    map: L.Map;
    currentFloor: number | null;
    floorMapLayer: L.GeoJSON;
    setCurrentFloor: (floor: number) => void;
    openAreaSidebar: () => void;
    imageOverlayMapLayer: L.GeoJSON;
}

const FloorSidebar = ({ imageOverlayMapLayer, buildingFromParent, map, currentFloor, floorMapLayer, setCurrentFloor, openAreaSidebar }: Props) => {
    const building = useFragment(FloorSidebarFragment, buildingFromParent);
    const [isCreateFloorModalOpen, handleCloseCreateFloorModal, handleOpenCreateFloorModal] = useBooleanState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const currentFloorData = useMemo(() => building.floors.find((floor) => floor.databaseId === currentFloor), [currentFloor]);

    const [commit, isInFlight] = useMutation<FloorSidebarFloorMutation>(graphql`
    mutation FloorSidebarFloorMutation($data: FloorModifyInput!) {
        modifyFloor(data: $data) {
            ...FloorListItemFragment
            ...GuideImageFragment
        }
    }
    `);

    const modifyFloor = async (variables: FloorSidebarFloorMutation$variables) => {
        if (!currentFloor) {
            throw new Error("floor not set")
        }
        try {
            commit({
                variables,
                onError(error) {
                    setFormError(error.message);
                }
            });
        } catch (error) {
            const errorMessage = (error as Error).message;
            setFormError(errorMessage);
        }
    };
    const handleFloorShapeUpdate = () => {
        if (!currentFloor) {
            throw new Error("floor not set")
        }
        modifyFloor({
            data: {
                id: currentFloor,
                newShape: {
                    shape: JSON.stringify(floorMapLayer.toGeoJSON())
                }
            }
        }
        )
    }

    const onShapeEdit = () => {
        if (!map) return;
        handleFloorShapeUpdate()
    }

    const onShapeRemove = (event: L.LeafletEvent) => {
        if (!map) return;
        floorMapLayer.removeLayer(event.layer);
        handleFloorShapeUpdate()
        if (event.layer instanceof L.Polygon) {
            setWhetherBuildingOrEntrenceMapping(false);
        }
    }

    const onShapeCreate = (event: L.LeafletEvent) => {
        if (!map) return;
        floorMapLayer.addLayer(event.layer);
        event.layer.on('pm:edit', onShapeEdit)
        event.layer.on('pm:remove', onShapeRemove)
        handleFloorShapeUpdate()
        setWhetherBuildingOrEntrenceMapping(true);
    }

    const setWhetherBuildingOrEntrenceMapping = (floorPolygonExists: boolean) => {
        // this line needs to be above map.pm.enableDraw or a bug occurs where the ploygon vertex placer doesn't follow the mouse
        map.removeEventListener("pm:create");
        if (!floorPolygonExists) {
            map.pm.enableDraw('Polygon');
        } else {
            map.pm.disableDraw();
        }
        // Before moving this eventlisner here, creating shapes was using an old version of the state
        // This code runs everytime the floor is changed so the onShapeCreate always is referenceing the proper version of currentFloor
        map.on('pm:create', onShapeCreate);
        map.pm.Toolbar.setButtonDisabled("Polygon", floorPolygonExists);
        map.pm.Toolbar.setButtonDisabled("Entrances", !floorPolygonExists);
    }

    useEffect(() => {
        if (currentFloor === null) {
            return;
        }
        removeAllLayersFromLayerGroup(floorMapLayer, map);

        const currentFloorRef = building.floors.find(floor => floor.databaseId === currentFloor);
        if (!currentFloorRef) {
            throw new Error("No floor matching the current floor found")
        }

        if (!currentFloorRef.shape) {
            setWhetherBuildingOrEntrenceMapping(false);
        } else {
            const geoJson: GeoJSON.FeatureCollection = JSON.parse(currentFloorRef.shape);
            // This covers the case where there are entrence markers but no polygon
            setWhetherBuildingOrEntrenceMapping(geoJson.features.findIndex(feature => { return feature.geometry.type === "Polygon" }) > -1);
            // add the geoJson to the floor and add the proper event listeners
            floorMapLayer.addData(geoJson);
            floorMapLayer.addTo(map)
            floorMapLayer.getLayers().map((layer) => {
                layer.on('pm:edit', onShapeEdit)
                layer.on('pm:remove', onShapeRemove)
            })
            imageOverlayMapLayer.addTo(map)
        }

    }, [currentFloor])

    const floorListElements = building.floors.map((floor) => (<FloorListItem setCurrentFloor={setCurrentFloor} currentFloor={currentFloor} floorFromParent={floor} key={floor.id} />));

    return (
        <>
            <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
            <h2>Editor Sidebar {currentFloorData ?
                <Button color="dark-blue" onClick={openAreaSidebar}>Edit {currentFloorData.title} Areas</Button>
                : null}</h2>
            <Tooltip zIndex={50} opened={currentFloor === null} label="Create your first floor to get started">
                <Button color="dark-blue" onClick={handleOpenCreateFloorModal}>New Floor</Button>
            </Tooltip>
            <ScrollArea h={250}>
                {floorListElements}
            </ScrollArea>
            {currentFloorData ? <GuideImage key={currentFloorData.id} startPos={building.startPos} imageOverlayMapLayer={imageOverlayMapLayer} modifyFloor={modifyFloor} currentFloorData={currentFloorData} map={map} setFormError={(e: string) => setFormError(e)} /> : null}
            <CreateFloorModal isOpen={isCreateFloorModalOpen} closeModal={handleCloseCreateFloorModal} />
            <div>{isInFlight ? "saving ..." : "all saved"}</div>
        </>
    )
}

export default FloorSidebar;

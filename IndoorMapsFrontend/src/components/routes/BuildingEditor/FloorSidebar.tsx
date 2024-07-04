import { graphql, useFragment, useMutation } from "react-relay";
import { FloorSidebarBodyFragment$key } from "./__generated__/FloorSidebarBodyFragment.graphql";
import FloorListItem from "./FloorListItem";
import { Button, ScrollArea, Tooltip } from "@mantine/core";
import FormErrorNotification from "../../forms/FormErrorNotification";
import CreateFloorModal from "../../forms/CreateFloorModal";
import { useEffect, useState } from "react";
import { useBooleanState, useRefreshRelayCache } from "../../../hooks";
import { FloorSidebarFloorMutation, FloorSidebarFloorMutation$variables } from "./__generated__/FloorSidebarFloorMutation.graphql";
import * as L from "leaflet";


const FloorSidebarFragment = graphql`
  fragment FloorSidebarBodyFragment on Building
  {
    id
    databaseId
    floors {
      id
      databaseId
      shape
      ...FloorListItemFragment
    }
  }
`;

interface Props {
    buildingFromParent: FloorSidebarBodyFragment$key;
    map: L.Map;
    currentFloor: number | null;
    floor: L.GeoJSON;
    setCurrentFloor: (floor: number) => void;
}

const FloorSidebar = ({ buildingFromParent, map, currentFloor, floor, setCurrentFloor }: Props) => {
    const building = useFragment(FloorSidebarFragment, buildingFromParent);
    const [isCreateFloorModalOpen, handleCloseCreateFloorModal, handleOpenCreateFloorModal] = useBooleanState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [refreshFloorData,] = useRefreshRelayCache();

    const [commit, isInFlight] = useMutation<FloorSidebarFloorMutation>(graphql`
    mutation FloorSidebarFloorMutation($data: FloorModifyInput!) {
        modifyFloor(data: $data) {
            databaseId
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
                onCompleted() {
                    refreshFloorData(currentFloor);
                },
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
                    shape: JSON.stringify(floor.toGeoJSON())
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
        floor.removeLayer(event.layer);
        handleFloorShapeUpdate()
    }

    const onShapeCreate = (event: L.LeafletEvent) => {
        if (!map) return;
        if (event.layer instanceof L.Polygon) {
            event.layer.setStyle({ color: 'black' });
        }
        floor.addLayer(event.layer);
        event.layer.on('pm:edit', onShapeEdit)
        event.layer.on('pm:remove', onShapeRemove)
        handleFloorShapeUpdate()
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
        // remove all layers that are in the Layer group
        floor.getLayers().map((layer) => {
            map.removeLayer(layer);
            floor.removeLayer(layer);
        })

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
            floor.addData(geoJson);
            floor.addTo(map)
            floor.getLayers().map((layer) => {
                layer.on('pm:edit', onShapeEdit)
                layer.on('pm:remove', onShapeRemove)
            })
        }

    }, [currentFloor])

    const floorListElements = building.floors.map((floor) => (<FloorListItem setCurrentFloor={setCurrentFloor} currentFloor={currentFloor} floorFromParent={floor} key={floor.id} />));

    return (
        <>
            <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
            <h2>Editor Sidebar</h2>
            <Tooltip zIndex={50} opened={currentFloor === null} label="Create your first floor to get started">
                <Button onClick={handleOpenCreateFloorModal}>New Floor</Button>
            </Tooltip>
            <ScrollArea h={250}>
                {floorListElements}
            </ScrollArea>
            <CreateFloorModal isOpen={isCreateFloorModalOpen} closeModal={handleCloseCreateFloorModal} />
            <div>{isInFlight ? "saving ..." : "all saved"}</div>
        </>
    )
}

export default FloorSidebar;

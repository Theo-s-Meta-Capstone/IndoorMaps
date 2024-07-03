import { graphql, useFragment, useMutation } from "react-relay";
import { EditorSidebarBodyFragment$key } from "./__generated__/EditorSidebarBodyFragment.graphql";
import CreateFloorModal from "../../forms/CreateFloorModal";
import { useBooleanState, useRefreshRelayCache } from "../../../hooks";
import { Button, ScrollArea, Tooltip, Notification } from "@mantine/core";
import FloorListItem from "./FloorListItem";
import { useEffect, useState } from "react";
import * as L from "leaflet";
import { EditorSidebarFloorMutation, EditorSidebarFloorMutation$variables } from "./__generated__/EditorSidebarFloorMutation.graphql";

const EditorSidebarFragment = graphql`
  fragment EditorSidebarBodyFragment on Building
  {
    id
    databaseId
    title
    startPos {
      lat
      lon
    }
    address
    floors {
      id
      databaseId
      shape
      ...FloorListItemFragment
    }
  }
`;

interface Props {
  buildingFromParent: EditorSidebarBodyFragment$key;
  map: L.Map;
}

const floor = L.geoJSON();

const EditorSidebar = ({ buildingFromParent, map }: Props) => {
  const buildingData = useFragment(EditorSidebarFragment, buildingFromParent);
  const [isCreateFloorModalOpen, handleCloseCreateFloorModal, handleOpenCreateFloorModal] = useBooleanState(false);
  const [currentFloor, setCurrentFloor] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [refreshFloorData,] = useRefreshRelayCache();

  const [commit, isInFlight] = useMutation<EditorSidebarFloorMutation>(graphql`
        mutation EditorSidebarFloorMutation($data: FloorModifyInput!) {
          modifyFloor(data: $data) {
            databaseId
          }
        }
    `);

  const modifyFloor = async (variables: EditorSidebarFloorMutation$variables) => {
    if(!currentFloor){
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
    if(!currentFloor){
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

  const handleFloorChange = (newFloor: number) => {
    setCurrentFloor(newFloor);
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

  useEffect(() => {
    if (buildingData.floors.length !== 0) {
      setCurrentFloor(buildingData.floors[0].databaseId)
    }

  }, [])

  const setWhetherBuildingOrEntrenceMapping = (floorPolygonExists: boolean) => {
    if (!floorPolygonExists) {
      map.pm.enableDraw('Polygon');
    }else{
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

    const currentFloorRef = buildingData.floors.find(floor => floor.databaseId === currentFloor);
    if (!currentFloorRef) {
      throw new Error("No floor matching the current floor found")
    }

    if (!currentFloorRef.shape) {
      setWhetherBuildingOrEntrenceMapping(false);
    } else {
      const geoJson: GeoJSON.FeatureCollection = JSON.parse(JSON.parse(currentFloorRef.shape));
      floor.addData(geoJson);
      floor.addTo(map)
      floor.getLayers().map((layer) => {
        layer.on('pm:edit', onShapeEdit)
        layer.on('pm:remove', onShapeRemove)
      })
      // This covers the case where there are entrence markers but no polygon
      setWhetherBuildingOrEntrenceMapping(geoJson.features.findIndex(feature => { return feature.geometry.type === "Polygon" }) > -1);
    }

  }, [currentFloor])

  const floorListElements = buildingData.floors.map((floor, i) => (<FloorListItem setCurrentFloor={handleFloorChange} currentFloor={currentFloor} floorFromParent={floor} key={i} />));

  return (
    <aside className="EditorSidebar">
      {formError ?
        <Notification color="red" title="Error" onClose={() => { setFormError(null) }} closeButtonProps={{ 'aria-label': 'Hide notification' }}>
          {formError}
        </Notification>
        : null}
      <h1>Editor Sidebar</h1>
      <Tooltip opened={currentFloor === -1} label="Create your first floor to get started">
        <Button onClick={handleOpenCreateFloorModal}>New Floor</Button>
      </Tooltip>
      <CreateFloorModal isOpen={isCreateFloorModalOpen} closeModal={handleCloseCreateFloorModal} />
      <ScrollArea h={250}>
        {floorListElements}
      </ScrollArea>
      <div>{isInFlight ? "saving ..." : "all saved"}</div>
    </aside>
  )
}

export default EditorSidebar;

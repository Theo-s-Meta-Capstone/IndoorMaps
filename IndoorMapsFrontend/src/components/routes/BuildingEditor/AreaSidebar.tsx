import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { AreaSidebarBodyFragment$key } from "./__generated__/AreaSidebarBodyFragment.graphql";
import FormErrorNotification from "../../forms/FormErrorNotification";
import { useEffect, useState } from "react";
import { AreaSidebarCreateMutation } from "./__generated__/AreaSidebarCreateMutation.graphql";
import { AreaSidebarDeleteAreaMutation, AreaSidebarDeleteAreaMutation$variables } from "./__generated__/AreaSidebarDeleteAreaMutation.graphql";
import { useRefreshRelayCache } from "../../../utils/hooks";
import { AreaSidebarUpdateAreaMutation, AreaSidebarUpdateAreaMutation$variables } from "./__generated__/AreaSidebarUpdateAreaMutation.graphql";
import * as L from "leaflet";
import EditAreaForm from "../../forms/EditAreaForm";

// TODO: convert into refetch able fragment to make it so that areas are only loaded when needed
const AreaSidebarFragment = graphql`
  fragment AreaSidebarBodyFragment on Floor
  {
    id
    databaseId
    areas {
        id
        databaseId
        title
        description
        shape
        traversable
        category
    }
  }
`;

interface Props {
    floorFromParent: AreaSidebarBodyFragment$key | undefined;
    map: L.Map;
    areasMapLayer: L.GeoJSON;
}

const AreaSidebar = ({ floorFromParent, map, areasMapLayer }: Props) => {
    const floorData = useFragment(AreaSidebarFragment, floorFromParent);
    const [formError, setFormError] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState<L.Layer | null>(null);
    const [refreshFloorData,] = useRefreshRelayCache();

    const handleChangeSelectedArea = (layer: L.Layer) => {
        setSelectedArea(prev => {
            if (prev !== layer && prev instanceof L.Polygon) {
                prev.setStyle({ color: 'blue' });
            }
            return layer
        });
    }

    const [commitCreateArea, isInFlightCreateArea] = useMutation<AreaSidebarCreateMutation>(graphql`
    mutation AreaSidebarCreateMutation($input: AreaCreateInput!) {
        createArea(data: $input) {
            databaseId
            floorDatabaseId
        }
    }
    `);

    const onShapeCreate = (event: L.LeafletEvent) => {
        if (!map) return;
        if (!floorData) {
            setFormError("No Floor Selected");
            return;
        }
        const layerGeoJSON: GeoJSON.Feature = event.layer.toGeoJSON();
        areasMapLayer.addLayer(event.layer);

        try {
            commitCreateArea({
                variables: {
                    input: {
                        "floorDatabseId": floorData.databaseId,
                        "title": "",
                        "description": "",
                        "shape": JSON.stringify(layerGeoJSON),
                    },
                },
                onCompleted(data) {
                    event.layer.feature = layerGeoJSON;
                    event.layer.feature.properties.databaseId = data.createArea.databaseId
                    event.layer.feature.properties.title = "";
                    event.layer.feature.properties.description = "";
                    handleChangeSelectedArea(event.layer);
                    event.layer.on('click', () => {
                        handleChangeSelectedArea(event.layer);
                    });
                    event.layer.on('pm:edit', onShapeEdit)
                    event.layer.on('pm:remove', onShapeRemove)
                    refreshFloorData(floorData.databaseId);
                },
                onError(error) {
                    setFormError(error.message);
                }
            });
        } catch (error) {
            const errorMessage = (error as Error).message;
            setFormError(errorMessage);
        }
    }

    const [commitUpdateArea, isInFlightUpdateArea] = useMutation<AreaSidebarUpdateAreaMutation>(graphql`
    mutation AreaSidebarUpdateAreaMutation($data: AreaModifyInput!) {
        modifyArea(data: $data) {
            success
            databaseId
        }
    }
    `);

    const updateArea = async (variables: AreaSidebarUpdateAreaMutation$variables) => {
        if (!floorData) {
            throw new Error("floor not set")
        }
        try {
            commitUpdateArea({
                variables,
                onCompleted() {
                    refreshFloorData(floorData.databaseId);
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

    const onShapeEdit = (event: L.LeafletEvent) => {
        if (!map) return;
        handleChangeSelectedArea(event.layer);
        updateArea({
            data: {
                id: event.layer.feature.properties.databaseId,
                shape: JSON.stringify(event.layer.toGeoJSON()),
            }
        })
    }

    const [commitDeleteArea, isInFlightDeleteArea] = useMutation<AreaSidebarDeleteAreaMutation>(graphql`
    mutation AreaSidebarDeleteAreaMutation($data: AreaUniqueInput!) {
        deleteArea(data: $data) {
            success
            databaseId
        }
    }
    `);
    const deleteArea = async (variables: AreaSidebarDeleteAreaMutation$variables) => {
        if (!floorData) {
            throw new Error("floor not set")
        }
        try {
            commitDeleteArea({
                variables,
                onCompleted() {
                    refreshFloorData(floorData.databaseId);
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

    const onShapeRemove = (event: L.LeafletEvent) => {
        if (!map) return;
        deleteArea({
            data: {
                id: event.layer.feature.properties.databaseId,
            }
        }
        )
    }

    useEffect(() => {
        console.log("refetching")
        if (floorData === null || floorData === undefined) {
            return;
        }
        // remove all layers that are in the Layer group
        areasMapLayer.getLayers().map((layer) => {
            map.removeLayer(layer);
            areasMapLayer.removeLayer(layer);
        })

        floorData.areas.forEach((area) => {
            const geoJson: GeoJSON.Feature = JSON.parse(area.shape);
            // inject my data into the geojson properties
            geoJson.properties!.databaseId = area.databaseId
            geoJson.properties!.title = area.title
            geoJson.properties!.description = area.description
            areasMapLayer.addData(geoJson);
        })

        map.removeEventListener("pm:create");
        map.on('pm:create', onShapeCreate);

        map.pm.Toolbar.setButtonDisabled("Polygon", false);
        // only when a shape is selected can entrances be placed
        map.pm.Toolbar.setButtonDisabled("Entrances", true);

        areasMapLayer.addTo(map)
        areasMapLayer.getLayers().map((layer) => {
            layer.on('click', () => {
                handleChangeSelectedArea(layer);
            });
            layer.on('pm:edit', onShapeEdit)
            layer.on('pm:remove', onShapeRemove)
        })
        // Not having the blank dependency array caused the map to be re-rendered every time a mutation was completed
        // This is bad because mutations don't update the relay cache, so the map would be re-rendered with the old data
    }, [])

    useEffect(() => {
        if (selectedArea instanceof L.Polygon) {
            selectedArea.setStyle({ color: 'red' });
        }
    }, [selectedArea])

    return (
        <>
            <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
            <h2>Area Sidebar</h2>
            {selectedArea ?
            <EditAreaForm area={selectedArea} />
            :
            null
            }
            <div>{(isInFlightCreateArea || isInFlightDeleteArea || isInFlightUpdateArea) ? "saving area map ..." : "area map saved"}</div>

        </>
    );
}

export default AreaSidebar;

import { useFragment, useMutation } from "react-relay";
import { graphql } from "relay-runtime";
import { AreaSidebarBodyFragment$key } from "./__generated__/AreaSidebarBodyFragment.graphql";
import FormErrorNotification from "../../components/forms/FormErrorNotification";
import { useEffect, useState } from "react";
import { AreaSidebarCreateMutation } from "./__generated__/AreaSidebarCreateMutation.graphql";
import { AreaSidebarDeleteAreaMutation, AreaSidebarDeleteAreaMutation$variables } from "./__generated__/AreaSidebarDeleteAreaMutation.graphql";
import { useRefreshRelayCache } from "../../utils/hooks";
import { AreaSidebarUpdateAreaMutation, AreaSidebarUpdateAreaMutation$variables } from "./__generated__/AreaSidebarUpdateAreaMutation.graphql";
import * as L from "leaflet";
import EditAreaForm from "../../components/forms/EditAreaForm";
import { removeAllLayersFromLayerGroup } from "../../utils/utils";
import { DoorMarkerIcon } from "../../utils/markerIcon";
import { Button } from "@mantine/core";

const AreaSidebarFragment = graphql`
  fragment AreaSidebarBodyFragment on Floor
  {
    id
    databaseId
    title
    areas {
        id
        databaseId
        title
        description
        shape
        traversable
        entrances
        category
    }
  }
`;

type Props = {
    floorFromParent: AreaSidebarBodyFragment$key | undefined;
    map: L.Map;
    areasMapLayer: L.GeoJSON;
    areaEntranceMapLayer: L.GeoJSON;
    closeSidebar: () => void;
    buildingId: number;
}

const AreaSidebar = ({ floorFromParent, map, areasMapLayer, areaEntranceMapLayer, closeSidebar, buildingId }: Props) => {
    const floorData = useFragment(AreaSidebarFragment, floorFromParent);
    const [formError, setFormError] = useState<string | null>(null);
    const [selectedArea, setSelectedArea] = useState<L.Layer | null>(null);
    const {refreshFloorData} = useRefreshRelayCache();

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

    const onAreaCreate = (event: L.LeafletEvent) => {
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
                        "buildingDatabaseId": buildingId
                    },
                },
                onCompleted(data) {
                    event.layer.feature = layerGeoJSON;
                    event.layer.feature.properties.databaseId = data.createArea.databaseId
                    event.layer.feature.properties.title = "";
                    event.layer.feature.properties.description = "";
                    event.layer.feature.properties.traversable = false;
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

    const onMarkerEdit = () => {
        if (!selectedArea || !(selectedArea instanceof L.Polygon)) return;
        updateArea({
            data: {
                id: selectedArea.feature!.properties.databaseId,
                entrances: {
                    shape: JSON.stringify(areaEntranceMapLayer.toGeoJSON()),
                }
            }
        })
    }

    const onMarkerDelete = (event: L.LeafletEvent) => {
        // TODO : invistage why it is .sourceTarget instead of layer and why sourceTarget works here but not anywhere else
        areaEntranceMapLayer.removeLayer(event.sourceTarget);
        if (!selectedArea || !(selectedArea instanceof L.Polygon)) return;
        updateArea({
            data: {
                id: selectedArea.feature!.properties.databaseId,
                entrances: {
                    shape: JSON.stringify(areaEntranceMapLayer.toGeoJSON()),
                }
            }
        })
    }

    const onMarkerCreate = (event: L.LeafletEvent) => {
        if (!selectedArea || !(selectedArea instanceof L.Polygon)) return;
        areaEntranceMapLayer.addLayer(event.layer);
        event.layer.on('pm:edit', onMarkerEdit)
        event.layer.on('pm:remove', onMarkerDelete)
        onMarkerEdit();
    }

    const onShapeCreate = (event: L.LeafletEvent) => {
        if (!map) return;
        if (!floorData) {
            setFormError("No Floor Selected");
            return;
        }
        if (event.layer instanceof L.Polygon) {
            onAreaCreate(event);
        }
        else if (event.layer instanceof L.Marker) {
            onMarkerCreate(event);
        }
        else {
            console.log(event.layer);
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
        setSelectedArea(null);
        deleteArea({
            data: {
                id: event.layer.feature.properties.databaseId,
            }
        }
        )
    }

    useEffect(() => {
        if (floorData === null || floorData === undefined) {
            return;
        }
        removeAllLayersFromLayerGroup(areasMapLayer, map);

        floorData.areas.forEach((area) => {
            const geoJson: GeoJSON.Feature = JSON.parse(area.shape);
            // inject my data into the geojson properties
            geoJson.properties!.databaseId = area.databaseId
            geoJson.properties!.title = area.title
            geoJson.properties!.description = area.description
            geoJson.properties!.traversable = area.traversable
            areasMapLayer.addData(geoJson);
        })

        map.removeEventListener("pm:create");
        map.on('pm:create', onShapeCreate);
        map.pm.Toolbar.setButtonDisabled("Polygon", false);

        areaEntranceMapLayer.addTo(map);
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
            map.removeEventListener("pm:create");
            map.on('pm:create', onShapeCreate);
            selectedArea.setStyle({ color: 'red' });
            // TODO: switch to a different icon for indoor doors
            map.pm.Toolbar.setButtonDisabled("Entrances", false);
            removeAllLayersFromLayerGroup(areaEntranceMapLayer, map);
            if (selectedArea.feature) {
                // type script is not smart enough to know that selectedArea.feature will be defined
                const areaData = floorData?.areas.find(area => area.databaseId === selectedArea.feature!.properties.databaseId);
                if (!areaData || !areaData.entrances) return;
                const geoJson: GeoJSON.FeatureCollection = JSON.parse(areaData.entrances);
                L.geoJSON(geoJson, {
                    pointToLayer: function (_feature, latlng) {
                        return L.marker(latlng, { icon: DoorMarkerIcon });
                    }
                }).addTo(areaEntranceMapLayer);
                // areaEntranceMapLayer.add(geoJson);
                areaEntranceMapLayer.getLayers().map((layer) => {
                    layer.on('pm:edit', onMarkerEdit)
                    layer.on('pm:remove', onMarkerDelete)
                })
            }

        } else {
            removeAllLayersFromLayerGroup(areaEntranceMapLayer, map);
            map.pm.Toolbar.setButtonDisabled("Entrances", true);
        }
    }, [selectedArea])

    return (
        <>
            <Button color="dark-blue" onClick={closeSidebar}>{"<- Back to floors"}</Button>
            <FormErrorNotification formError={formError} onClose={() => { setFormError(null) }} />
            <h2>{floorData?.title} Area Editor</h2>
            {selectedArea ?
                <EditAreaForm area={selectedArea} />
                :
                <p className="noAreaSelectedText">Create New areas with the <img src={"/polygonTool.svg"} alt="React Logo" />polygon tool <br />
                    Select an Area to edit its Name and Description
                </p>
            }
            <div>{(isInFlightCreateArea || isInFlightDeleteArea || isInFlightUpdateArea) ? "saving area map ..." : "area map saved"}</div>

        </>
    );
}

export default AreaSidebar;

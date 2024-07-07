export const removeAllLayersFromLayerGroup = (layerGroup: L.LayerGroup, mapRef: L.Map) => {
    // remove all layers that are in the Layer group
    layerGroup.getLayers().map((layer) => {
        mapRef.removeLayer(layer);
        layerGroup.removeLayer(layer);
    })
}

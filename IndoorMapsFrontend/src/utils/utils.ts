export const removeAllLayersFromLayerGroup = (layerGroup: L.LayerGroup, mapRef: L.Map) => {
    // remove all layers that are in the Layer group
    layerGroup.getLayers().map((layer) => {
        mapRef.removeLayer(layer);
        layerGroup.removeLayer(layer);
    })
}

export const getPointBetweentwoPoints = (point1: number[], point2: number[], position: number) => {
    return [
        point1[0] + (point2[0] - point1[0]) * position,
        point1[1] + (point2[1] - point1[1]) * position
    ]
}

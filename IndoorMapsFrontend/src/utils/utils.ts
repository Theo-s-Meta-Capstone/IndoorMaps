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

// Based on the Trapezoid fomula https://en.wikipedia.org/wiki/Shoelace_formula
export const getAreaOfPolygon = (polygon: L.Polygon) => {
    const points = polygon.getLatLngs()[0] as L.LatLng[];
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
        sum += (points[i].lng + points[(i + 1)%points.length].lng) * (points[i].lat - points[(i + 1)%points.length].lat)
    }
    return Math.abs(sum / 2)*1000000
}

/**
 * Removes all layers from a layer group and removes them from the map
 * @param layerGroup the layer group to remove all layers from
 * @param mapRef the map that the layer group is on
 */
export const removeAllLayersFromLayerGroup = (layerGroup: L.LayerGroup, mapRef: L.Map) => {
    // remove all layers that are in the Layer group
    layerGroup.getLayers().map((layer) => {
        mapRef.removeLayer(layer);
        layerGroup.removeLayer(layer);
    })
}

/**
 * gets a point along the line between two points
 * @param point1 the start of the line
 * @param point2 the end of the line
 * @param position the position of the point along the line, between 0 and 1
 * @returns the point along the line
 */
export const getPointBetweentwoPoints = (point1: number[], point2: number[], position: number) => {
    return [
        point1[0] + (point2[0] - point1[0]) * position,
        point1[1] + (point2[1] - point1[1]) * position
    ]
}

// Based on the Trapezoid fomula https://en.wikipedia.org/wiki/Shoelace_formula
/**
 * Gets the "relative" area of a polygon, does not account for the curivture of the earth or differences in lat at differnt distances from the equator
 * @param polygon the polygon to get the area of
 * @returns the area of the polygon in no units (as in the areas can only be used to compare with eachother)
 */
export const getAreaOfPolygon = (polygon: L.Polygon): number => {
    const points = polygon.getLatLngs()[0] as L.LatLng[];
    let sum = 0;
    for (let i = 0; i < points.length; i++) {
        sum += (points[i].lng + points[(i + 1)%points.length].lng) * (points[i].lat - points[(i + 1)%points.length].lat)
    }
    return Math.abs(sum / 2)*1000000
}

import { createControlComponent } from '@react-leaflet/core';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';


const Geoman = L.Control.extend({
    initialize() {
        L.setOptions(this, {});
    },

    addTo(map: L.Map) {
        if (!map.pm) return;

        map.pm.addControls({
            drawPolyline: false,
            drawRectangle: false,
            drawMarker: false,
            position: "topright",
            drawCircle: false,
            oneBlock: true,
            drawCircleMarker: false,
            drawText: false,
            cutPolygon: false,
        });

    },
});

const createGeomanInstance = () => {
    return new Geoman();
};

export const GeomanControl = createControlComponent(createGeomanInstance);

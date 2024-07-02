import { createControlComponent } from '@react-leaflet/core';
import * as L from 'leaflet';
import '@geoman-io/leaflet-geoman-free';
import '@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css';

interface Props extends L.ControlOptions {

}

let geoManOptions: Props;

const Geoman = L.Control.extend({
    initialize(options: Props) {
        geoManOptions = options;
        L.setOptions(this, options);
    },

    addTo(map: L.Map) {
        if (!map.pm) return;

        map.pm.addControls({
            drawPolyline: false,
            drawRectangle: false,
            drawMarker: false,
            drawCircleMarker: true,
            position: "topright",
            drawCircle: false,
            oneBlock: true,
        });

    },
});

const createGeomanInstance = (props: Props) => {
    return new Geoman(props);
};

export const GeomanControl = createControlComponent(createGeomanInstance);

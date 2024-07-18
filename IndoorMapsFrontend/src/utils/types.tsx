import { LatLng } from "leaflet"

export type LiveLocationMarker = {
    id: string,
    latitude: number,
    longitude: number,
    name: string,
    message: string,
}

export type AreaToAreaRouteInfo = {
    to?: {
        areaDatabaseId: number,
        floorDatabaseId: number,
        title: string,
        description: string
    }
    from?: {
        areaDatabaseId: number,
        floorDatabaseId: number,
        title: string,
        description: string
    } | "gpsLocation",
    currentGPSCoords?: LatLng,
    path?: LatLng[]
    walls?: string
    navMesh?: string
    info?: {
        requestTime: number,
        generateNewNavMesh: boolean,
    }
    distance?: number
    options?: {
        [key: string]: boolean | undefined,
        showWalls?: boolean,
        showEdges?: boolean,
        showInfo?: boolean,
        useVoronoi?: boolean,
    }
}

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
        isLatLon: false,
        floorDatabaseId: number,
        title: string,
        description?: string
        areaDatabaseId: number,
    } | {
        isLatLon: true,
        floorDatabaseId: number,
        title: string,
        description?: string
        location: LatLng,
        id?: string,
        isUpdate: boolean,
    },
    from?: {
        isLatLon: false,
        floorDatabaseId: number,
        title: string,
        description?: string
        areaDatabaseId?: number,
    } | {
        isLatLon: true,
        title: string,
        description?: string
        location: LatLng,
    },
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

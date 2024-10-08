/**
 * this file containes functions that convert between the database type and the Graphql Types, It is used any time data is sent from the database to the front end
*/
import { User } from '../graphqlSchemaTypes/User.js'
import { Building, LatLng } from '../graphqlSchemaTypes/Building.js'
import { Building as DbBuilding, Floor as DbFloor, Area as DbArea, User as DbUser, Prisma } from '@prisma/client'
import { Floor } from '../graphqlSchemaTypes/Floor.js'
import { Area } from '../graphqlSchemaTypes/Area.js'
import { BuildingGroup } from '../graphqlSchemaTypes/BuildingGroup.js'

type DbBuildingGroup = Prisma.BuildingGroupGetPayload<{
    include: {
        buildings: true
    }
}>

type DbAreaWithFloorTitle = Prisma.AreaGetPayload<{
    include: {
        floor: {
            select: {
                title: true
            }
        }
    }
}>

export const convertToGraphQLUser = (userFromDB: DbUser): User => {
    const user: User = {
        id: "user" + userFromDB.id,
        databaseId: userFromDB.id,
        name: userFromDB.name,
        email: userFromDB.email,
        isEmailVerified: userFromDB.isEmailVerified
    }
    return user;
}

export const convertToGraphQLBuilding = (buildingFromDB: DbBuilding): Building => {
    const building: Building = {
        id: "building" + buildingFromDB.id,
        databaseId: buildingFromDB.id,
        title: buildingFromDB.title,
        address: buildingFromDB.address,
        startPos: new LatLng(buildingFromDB.startLat, buildingFromDB.startLon)
    }
    return building;
}

export const convertToGraphQLFloor = (floorFromDB: DbFloor): Floor => {
    const floor: Floor = {
        ...floorFromDB,
        guideImage: floorFromDB.guideImage !== null ? floorFromDB.guideImage : undefined,
        guideImageShape: floorFromDB.guideImageShape !== null ? JSON.stringify(floorFromDB.guideImageShape) : undefined,
        shape: floorFromDB.shape !== null ? JSON.stringify(floorFromDB.shape) : undefined,
        databaseId: floorFromDB.id,
        guideImageRotation: floorFromDB.guideImageRotation ? floorFromDB.guideImageRotation : undefined,
        id: "floor" + floorFromDB.id.toString()
    }
    return floor;
}

export const convertToGraphQlArea = (areaFromDB: DbArea): Area => {
    const area: Area = {
        ...areaFromDB,
        shape: JSON.stringify(areaFromDB.shape),
        databaseId: areaFromDB.id,
        id: "area" + areaFromDB.id.toString(),
        entrances: areaFromDB.entrances !== null ? JSON.stringify(areaFromDB.entrances) : undefined,
        floorDatabaseId: areaFromDB.floorId,
        floorTitle: undefined
    }
    return area;
}

export const convertToGraphQlAreaWithFloorTitle = (areaFromDB: DbAreaWithFloorTitle): Area => {
    const area = convertToGraphQlArea(areaFromDB);
    area.floorTitle = areaFromDB.floor.title
    return area;
}

export const convertToGraphQLBuildingGroup = (buildingGroupFromDB: DbBuildingGroup): BuildingGroup => {
    const buildingGroup: BuildingGroup = {
        ...buildingGroupFromDB,
        id: "buildingGroup" + buildingGroupFromDB.id,
        databaseId: buildingGroupFromDB.id,
        buildings: buildingGroupFromDB.buildings.map(building => convertToGraphQLBuilding(building))
    }
    return buildingGroup;
}

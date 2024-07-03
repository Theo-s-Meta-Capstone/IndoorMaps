/**
 * this file containes functions that convert between the database type and the Graphql Types, It is used any time data is sent from the database to the front end
*/

import { User } from '../User.js'
import { User as DbUser} from '@prisma/client';
import { Building, Floor, LatLng } from '../Building.js'
import { Building as DbBuilding, Floor as DbFloor } from '@prisma/client'

export const convertToGraphQLUser = (userFromDB: DbUser): User => {
    const user: User = {
        id: "user"+userFromDB.id,
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
        shape: floorFromDB.shape !== null ? JSON.stringify(floorFromDB.shape) : undefined,
        databaseId: floorFromDB.id,
        id: "floor" + floorFromDB.id.toString()
    }
    return floor;
}

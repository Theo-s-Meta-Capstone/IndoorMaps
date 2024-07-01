import { User } from '../User.js'
import { User as DbUser} from '@prisma/client';
import { Building } from '../Building.js'
import { Building as DbBuilding, Floor } from '@prisma/client'

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

interface DbBuildingWithFloors extends DbBuilding {
    floors: Floor[]
}

export const convertToGraphQLBuilding = (buildingFromDB: DbBuildingWithFloors): Building => {
    const building: Building = {
        id: "building" + buildingFromDB.id,
        databaseId: buildingFromDB.id,
        title: buildingFromDB.title,
        description: buildingFromDB.description,
        floors: buildingFromDB.floors.map((value: Floor) => {
            return {
                ...value,
                id: "floor" + value.id.toString()
            }
        }),
    }
    return building;
}

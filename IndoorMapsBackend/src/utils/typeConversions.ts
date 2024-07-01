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

export const convertToGraphQLBuilding = (buildingFromDB: DbBuilding): Building => {
    const building: Building = {
        id: "building" + buildingFromDB.id,
        databaseId: buildingFromDB.id,
        title: buildingFromDB.title,
        description: buildingFromDB.description,
    }
    return building;
}

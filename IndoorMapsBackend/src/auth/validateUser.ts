import { $Enums, BuildingEditors } from "@prisma/client";
import { User } from "../graphqlSchemaTypes/User.js";
import { Context } from "../utils/context.js";
import { verifyAccessToken } from "./jwt.js";
import { GraphQLError } from "graphql";
import { throwGraphQLBadInput } from "../utils/generic.js";

/**
 * Checks the data inside of a JWT sent from the user for whether it contains valid data and whether it is inside the user.tokens array
 * @param authHeader the auth header that was recieved with a request
 * @returns [boolean, user] the boolean just specifies whether a valid user sent the request
 *          then the user contains the userData from that token which is often used to set the author of boards, etc
 */
export const validateUser = async (cookies: Context["cookies"]): Promise<User | null> => {
    try {
        if (!cookies || !cookies.jwt) {
            return null;
        }
        const [userData, token] = await verifyAccessToken(cookies.jwt);
        return userData
    }
    catch (e) {
        //Invalid cookie JWT
        if (e == "JWT not valid") {
            return null;
        }
        console.error(e)
        console.error("issue with validateUser")
        return null;
    }
}

/**
 * Gets the user data if there is a valided user cooked associated with the request
 * otherwise throws an error
 * useful for protected mutation/queries
 * @param cookies the Req cookies
 * @returns Promise<User> if there isn't a valid user, throws a GraphQLError
 */
export const getUserOrThrowError = async (cookies: Context["cookies"]): Promise<User> => {
    const user = await validateUser(cookies);
    if (!user) throw throwGraphQLBadInput('User not signed in')
    return user;
}

const editorLevels = { "viewer": 0, "editor": 1, "owner": 2 }

export const getUsersBuildingEditorStatus = async (user: User, building: number, ctx: Context): Promise<null | $Enums.EditorLevel> => {
    if (!user) {
        return null;
    }
    const buildingEditorRows = await ctx.prisma.buildingEditors.findMany({
        where: {
            buildingId: building,
            userId: user.databaseId,
        }
    })
    if (buildingEditorRows.length === 0) {
        return null;
    }
    // Searches for the highest role that the user has in the building
    let role: $Enums.EditorLevel = "viewer";
    buildingEditorRows.forEach((row) => {
        if (editorLevels[row.editorLevel] > editorLevels[role]) {
            role = row.editorLevel;
        }
    })
    return role;
}

export const checkAuthrizedBuildingEditor = async (buildingDatabaseId: number, ctx: Context) => {
    const user = await getUserOrThrowError(ctx.cookies);
    let status = await getUsersBuildingEditorStatus(user, buildingDatabaseId, ctx);
    if (status === null || status === "viewer") {
        return throwGraphQLBadInput('User is not authorized to edit this building')
    }
    return null
}

export const checkAuthrizedFloorEditor = async (floorDatabaseId: number, ctx: Context) => {
    const user = await getUserOrThrowError(ctx.cookies);
    const building = await ctx.prisma.floor.findUnique({
        where: {
            id: floorDatabaseId,
        },
        select:{
            buildingId: true,
        }
    })
    if(!building){
        return throwGraphQLBadInput('Building Not found')
    }
    let status = await getUsersBuildingEditorStatus(user, building.buildingId, ctx);
    if (status === null || status === "viewer") {
        return throwGraphQLBadInput('User is not authorized to edit this building')
    }
    return null
}

export const checkAuthrizedAreaEditor = async (areaDatasId: number, ctx: Context) => {
    const user = await getUserOrThrowError(ctx.cookies);
    const area = await ctx.prisma.area.findUnique({
        where: {
            id: areaDatasId,
        },
        select:{
            floor: {
                select:{
                    buildingId: true,
                }
            }
        }
    })
    if(!area){
        return throwGraphQLBadInput('Area Not found')
    }
    let status = await getUsersBuildingEditorStatus(user, area.floor.buildingId, ctx);
    if (status === null || status === "viewer") {
        return throwGraphQLBadInput('User is not authorized to edit this building')
    }
    return null
}

import { User } from "../src/User.js";
import jwt from "./jwt.js";

/**
 * Checks the data inside of a JWT sent from the user for whether it contains valid data and whether it is inside the user.tokens array
 * @param authHeader the auth header that was recieved with a request
 * @returns [boolean, user] the boolean just specifies whether a valid user sent the request
 *          then the user contains the userData from that token which is often used to set the author of boards, etc
 */
export const validateUser = async (authHeader: string | undefined): Promise<[boolean, User | null]> => {
    try {
        if (!authHeader || !authHeader.split(' ')[1]) {
            return [false, null]
        }

        const userData = await jwt.verifyAccessToken(authHeader.split(' ')[1]);
        return [true, userData]
    }
    catch (e) {
        console.error(e)
        console.error("issue with validateUser")
        return [false, null]
    }

}

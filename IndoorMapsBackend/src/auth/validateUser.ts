import { isInstance } from "class-validator";
import { User } from "../User.js";
import { Context } from "../context.js";
import { verifyAccessToken } from "./jwt.js";
import { GraphQLError } from "graphql";

/**
 * Checks the data inside of a JWT sent from the user for whether it contains valid data and whether it is inside the user.tokens array
 * @param authHeader the auth header that was recieved with a request
 * @returns [boolean, user] the boolean just specifies whether a valid user sent the request
 *          then the user contains the userData from that token which is often used to set the author of boards, etc
 */
export const validateUser = async (cookies: Context["cookies"]): Promise<User | null> => {
    try {
        if(!cookies || !cookies.jwt){
            return null;
        }
        const [userData, token] = await verifyAccessToken(cookies.jwt);
        return userData
    }
    catch (e) {
        //Invalid cookie JWT
        if(e  == "JWT not valid"){
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
    if (!user) {
        throw new GraphQLError('User not signed in', {
            extensions: {
                code: 'BAD_USER_INPUT',
            },
        });
    }
    return user;
}

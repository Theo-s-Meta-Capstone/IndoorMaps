import jwt from 'jsonwebtoken'
import 'dotenv/config'
import { User as DbUser } from '@prisma/client';
import { User } from "../graphqlSchemaTypes/User.js"
import { prisma } from '../utils/context.js'
import { convertToGraphQLUser } from '../utils/typeConversions.js';

const accessTokenSecret: string = process.env.ACCESS_TOKEN_SECRET ? process.env.ACCESS_TOKEN_SECRET : "ACCESS_TOKEN_SECRET";

export const signAccessToken = (payload: DbUser) => {
    // remove old tokens before creating a new token to reduce token length
    payload.tokens = [];
    return new Promise<string>((resolve, reject) => {
        jwt.sign({ payload }, accessTokenSecret, {
        }, async (err, token) => {
            if (err) {
                reject(" InternalServerError")
            }
            await prisma.user.update({
                where: {
                    id: payload.id,
                },
                data: {
                    tokens: {
                        push: token,
                    },
                },
            })
            if (token == undefined) {
                reject("Failed to generate Token")
                return;
            }
            resolve(token)
        })
    })
}

export const verifyAccessToken = (token: string): Promise<[User, string]> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, accessTokenSecret, async (err, payload) => {
            if (err) {
                const message = err.name == 'JsonWebTokenError' ? 'Unauthorized' : err.message
                return reject(message)
            } if (!payload) {
                return reject("unknown issue with payload data form jwt")
            }
            const userData = (payload as { payload: DbUser }).payload;
            const tokens = await prisma.user.findUnique({
                where: {
                    id: userData.id,
                },
                select: {
                    tokens: true
                }
            })
            if (!tokens) {
                return reject("JWT not valid")
            }
            if (!tokens.tokens.includes(token)) {
                return reject("JWT not valid")
            }
            resolve([convertToGraphQLUser(userData), token])
        })
    })
}

export const deleteAccessToken = async (token: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, accessTokenSecret, async (err, payload) => {
            if (err) {
                const message = err.name == 'JsonWebTokenError' ? 'Unauthorized' : err.message
                return reject(message)
            } if (!payload) {
                return reject("unknown issue with payload data form jwt")
            }
            const userData = (payload as { payload: DbUser }).payload;
            const tokens = await prisma.user.findUnique({
                where: {
                    id: userData.id,
                },
                select: {
                    tokens: true
                }
            })
            if (!tokens) {
                return reject("JWT not valid")
            }
            if (!tokens.tokens.includes(token)) {
                return reject("JWT not in user")
            }
            // modified from https://stackoverflow.com/questions/69364443/prisma-splice-item-from-array
            await prisma.user.update({
                where: {
                    id: userData.id,
                },
                data: {
                    tokens: {
                        set: tokens.tokens.filter((value) => value !== token),
                    },
                },
            });
            resolve()
        })
    })
}

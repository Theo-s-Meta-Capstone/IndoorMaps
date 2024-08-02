import bcrypt from 'bcryptjs'
import { Prisma } from "@prisma/client";
import { prisma } from '../utils/context.js'
import { SignInData } from "../types.js";
import { signAccessToken, signEmailVerifyToken, verifyAccessToken } from './jwt.js';

class AuthService {

    static async register(data: Prisma.UserCreateInput) {
        if (data.password == null) throw new Error('Password not valid')
        data.password = bcrypt.hashSync(data.password!, 8);
        const userFromDB = await prisma.user.create({
            data
        });

        const accessToken = await signAccessToken(userFromDB);

        return { userFromDB, accessToken };
    }
    static async login(data: SignInData) {
        const { email, password } = data;
        const userFromDB = await prisma.user.findUnique({
            where: {
                email
            }
        });
        if (!userFromDB) {
            throw new Error('User not registered')
        }
        const checkPassword = bcrypt.compareSync(password, userFromDB.password!)
        if (!checkPassword) throw new Error('Email address or password not valid')
        const accessToken = await signAccessToken(userFromDB)
        return { userFromDB, accessToken }
    }
    static async all() {
        const allUsers = await prisma.user.findMany();
        return allUsers;
    }
    static async getVerifyEmailToken(id: number) {
        const userFromDB = await prisma.user.findUnique({
            where: {
                id
            }
        });
        if (!userFromDB) {
            throw new Error('User registration issue')
        }
        return await signEmailVerifyToken(userFromDB)
    }
    static async convertVerifyEmailTokenToFullToken(emailVerificationToken: string) {
        const [userData,] = await verifyAccessToken(emailVerificationToken);
        const userFromDB = await prisma.user.update({
            where: {
                id: userData.databaseId
            },
            data: {
                isEmailVerified: true,
            }
        });
        if (!userFromDB) {
            throw new Error('User not found')
        }
        const accessToken = await signAccessToken(userFromDB)
        return { userFromDB, accessToken }
    }
}

export default AuthService;

import bcrypt from 'bcryptjs'
import { Prisma } from "@prisma/client";
import { prisma } from '../utils/context.js'
import { SignInData } from "../types.js";
import { signAccessToken } from './jwt.js';

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
        userFromDB.password = null
        const accessToken = await signAccessToken(userFromDB)
        return { userFromDB, accessToken }
    }
    static async all() {
        const allUsers = await prisma.user.findMany();
        return allUsers;
    }
}

export default AuthService;

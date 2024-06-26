import bcrypt from 'bcryptjs'
import { Prisma } from "@prisma/client";
import jwt from "./jwt.js"
import { context } from '../src/context.js'
import { SignInData } from "../src/types";

class AuthService {

    static async register(data: Prisma.UserCreateInput) {
        // const { email } = data;
        if (data.password == null) throw new Error('Password not valid')
        data.password = bcrypt.hashSync(data.password!, 8);
        let userFromDB = await context.prisma.user.create({
            data
        });

        const accessToken = await jwt.signAccessToken(userFromDB);

        return { userFromDB, accessToken };
    }
    static async login(data: SignInData) {
        const { email, password } = data;
        const userFromDB = await context.prisma.user.findUnique({
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
        const accessToken = await jwt.signAccessToken(userFromDB)
        return { userFromDB, accessToken }
    }
    static async all() {
        const allUsers = await context.prisma.user.findMany();
        return allUsers;
    }
}

export default AuthService;

import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

export interface Context {
  prisma: PrismaClient,
  cookies: { jwt: string } | undefined
}

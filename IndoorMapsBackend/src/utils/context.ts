import { PrismaClient } from '@prisma/client'
import express from 'express';

export const prisma = new PrismaClient()

export interface Context {
  prisma: PrismaClient,
  cookies: { jwt?: string } | undefined
  res: express.Response
}

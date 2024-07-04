import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()

import express from 'express';

export interface Context {
  prisma: PrismaClient,
  cookies: { jwt?: string } | undefined
  res: express.Response
}

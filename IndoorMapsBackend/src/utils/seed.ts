// currently this file is only used in the buildings.test.ts, it ensures that there is a user that can own the building

import { prisma } from '../context.js'
export async function seed() {
    const seedUser = await prisma.user.upsert({
        where: { email: 'seed@test.com' },
        update: {},
        create: {
            email: 'seed@test.com',
            name: 'seed user',
            password: 'seedpass',
            isEmailVerified: true
        },
    })
    return seedUser.id
}

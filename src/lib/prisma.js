import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.

const globalForPrisma = global

function createPrismaClient() {
    // For development without database, return a mock or throw helpful error
    if (!process.env.DATABASE_URL) {
        console.warn('DATABASE_URL not set. Database operations will fail.')
        return new PrismaClient()
    }

    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
    })
    const adapter = new PrismaPg(pool)

    return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}

export default prisma

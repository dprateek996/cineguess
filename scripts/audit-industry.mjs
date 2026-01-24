
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function audit() {
    console.log('Auditing Movie Industries...')

    const bollywood = await prisma.movie.findMany({
        where: { industry: 'BOLLYWOOD' },
        select: { title: true, releaseYear: true }
    })

    console.log(`\nFound ${bollywood.length} Bollywood movies:`)
    bollywood.forEach(m => console.log(`[B] ${m.title} (${m.releaseYear})`))

    const hollywood = await prisma.movie.findMany({
        where: { industry: 'HOLLYWOOD' },
        select: { title: true, releaseYear: true }
    })

    console.log(`\nFound ${hollywood.length} Hollywood movies:`)
    hollywood.forEach(m => console.log(`[H] ${m.title} (${m.releaseYear})`))

    await prisma.$disconnect()
    await pool.end()
}

audit().catch(e => {
    console.error(e)
    process.exit(1)
})

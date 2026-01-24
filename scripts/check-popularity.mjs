
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function check() {
    console.log('Checking Top 10 Movies by Popularity...')

    // Check Bollywood
    const bollywood = await prisma.movie.findMany({
        where: { industry: 'BOLLYWOOD' },
        orderBy: { popularity: 'desc' },
        take: 10,
        select: { title: true, popularity: true, voteCount: true }
    })

    console.log('\n--- BOLLYWOOD TOP 10 ---')
    bollywood.forEach((m, i) => console.log(`${i + 1}. ${m.title} (Pop: ${m.popularity})`))

    // Check Hollywood
    const hollywood = await prisma.movie.findMany({
        where: { industry: 'HOLLYWOOD' },
        orderBy: { popularity: 'desc' },
        take: 10,
        select: { title: true, popularity: true, voteCount: true }
    })

    console.log('\n--- HOLLYWOOD TOP 10 ---')
    hollywood.forEach((m, i) => console.log(`${i + 1}. ${m.title} (Pop: ${m.popularity})`))

    await prisma.$disconnect()
    await pool.end()
}

check().catch(console.error)

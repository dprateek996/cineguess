
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Fetching Bollywood movies...')

    const movies = await prisma.movie.findMany({
        where: {
            industry: 'BOLLYWOOD'
        },
        orderBy: {
            title: 'asc'
        },
        select: {
            title: true,
            releaseYear: true
        }
    })

    console.log(`Found ${movies.length} Bollywood movies.`)

    const output = movies.map(m => `${m.title} (${m.releaseYear})`).join('\n')
    fs.writeFileSync('bollywood_movies.txt', output)
    console.log('Exported to bollywood_movies.txt')

    // Also print to console
    console.log(output)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })

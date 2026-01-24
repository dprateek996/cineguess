
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const targets = [
    "Dabangg",
    "Drishyam",
    "Gangs of Wasseypur",
    "Ghajini",
    "Gully Boy",
    "RRR"
]

async function main() {
    console.log('Searching for close matches...')

    for (const t of targets) {
        console.log(`\nChecking: ${t}`)
        const matches = await prisma.movie.findMany({
            where: {
                title: { contains: t, mode: 'insensitive' }
            },
            select: { title: true, releaseYear: true, id: true }
        })

        matches.forEach(m => console.log(` - Found: "${m.title}" (${m.releaseYear})`))

        if (matches.length === 0) {
            console.log(' - No matches found.')
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })

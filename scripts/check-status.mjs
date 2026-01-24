
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const totalMovies = await prisma.movie.count()
    const hints = await prisma.hint.findMany({
        where: {
            OR: [
                { level2Dialogue: { contains: 'Dialogue coming soon' } },
                { level2Dialogue: { contains: 'quote from this' } }
            ]
        }
    })
    console.log(`Total Movies: ${totalMovies}`)
    console.log(`Movies with placeholder hints: ${hints.length}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })

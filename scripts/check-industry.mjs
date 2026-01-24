
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Checking movie industries...')

    const targets = ["Death Race 2", "1917", "300", "Aliens", "Angel Heart"] // Some suspects from the previous list

    const movies = await prisma.movie.findMany({
        where: {
            title: { in: targets }
        },
        select: { title: true, industry: true, releaseYear: true }
    })

    console.table(movies)

    // Also check how many 'HOLLYWOOD' movies are in 'BOLLYWOOD' industry roughly
    // This is hard to do without a list of known Hollywood movies, but we can check the count

    const hollywoodCount = await prisma.movie.count({ where: { industry: 'HOLLYWOOD' } })
    const bollywoodCount = await prisma.movie.count({ where: { industry: 'BOLLYWOOD' } })

    console.log(`\nStats:`)
    console.log(`HOLLYWOOD: ${hollywoodCount}`)
    console.log(`BOLLYWOOD: ${bollywoodCount}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })

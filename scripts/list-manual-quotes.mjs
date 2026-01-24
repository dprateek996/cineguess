
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const movies = await prisma.movie.findMany({
        where: {
            hints: {
                OR: [
                    { level2Dialogue: { contains: 'Dialogue coming soon' } },
                    { level2Dialogue: { contains: 'quote from this' } }
                ]
            }
        },
        orderBy: { title: 'asc' }
    })

    const bollywood = movies.filter(m => m.industry === 'BOLLYWOOD')
    const hollywood = movies.filter(m => m.industry === 'HOLLYWOOD')
    const others = movies.filter(m => m.industry !== 'BOLLYWOOD' && m.industry !== 'HOLLYWOOD')

    console.log('--- BOLLYWOOD ---')
    bollywood.forEach(m => console.log(`- ${m.title} (${m.releaseYear})`))

    console.log('\n--- HOLLYWOOD ---')
    hollywood.forEach(m => console.log(`- ${m.title} (${m.releaseYear})`))

    if (others.length > 0) {
        console.log('\n--- OTHERS ---')
        others.forEach(m => console.log(`- ${m.title} (${m.releaseYear}) [${m.industry}]`))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })

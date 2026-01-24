
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
    const brokenHints = await prisma.hint.findMany({
        where: {
            level2Dialogue: {
                startsWith: 'A memorable quote from this'
            }
        },
        include: {
            movie: true
        },
        orderBy: {
            movie: {
                title: 'asc'
            }
        }
    })

    console.log(`Found ${brokenHints.length} movies with broken quotes.`)

    const output = brokenHints.map(h => ({
        id: h.movie.id,
        title: h.movie.title,
        year: h.movie.releaseYear,
        industry: h.movie.industry
    }))

    fs.writeFileSync('broken_quotes.json', JSON.stringify(output, null, 2))
    console.log('Exported to broken_quotes.json')

    const textOutput = output.map(m => `${m.title} (${m.year})`).join('\n')
    fs.writeFileSync('broken_quotes.txt', textOutput)
    console.log('Exported to broken_quotes.txt')

    // Also print a simple text list
    console.log('\n--- MOVIE LIST ---')
    output.forEach(m => console.log(`${m.title} (${m.year}) - ${m.industry}`))
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })

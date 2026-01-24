
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Cleaning up industry mismatches...')

    // 1. Move Misclassified Movies to Hollywood (or delete if obscure)
    const updates = [
        { title: 'Green Street 3: Never Back Down', industry: 'HOLLYWOOD' },
        { title: 'The Science of Fictions', industry: 'HOLLYWOOD' }, // International
        { title: 'RRRrrrr!!!', industry: 'HOLLYWOOD' }, // French
        { title: 'Snowman', industry: 'HOLLYWOOD' }, // Likely the UK film?
        { title: 'The Hand That Rocks the Cradle', industry: 'HOLLYWOOD' },
    ]

    for (const update of updates) {
        try {
            const result = await prisma.movie.updateMany({
                where: {
                    title: update.title,
                    industry: 'BOLLYWOOD' // Only move if currently in Bollywood
                },
                data: { industry: update.industry }
            })
            if (result.count > 0) {
                console.log(`✅ Moved "${update.title}" to ${update.industry}`)
            }
        } catch (e) {
            console.error(`Failed to update ${update.title}:`, e.message)
        }
    }

    // 2. Delete invalid/phantom movies
    const deletions = [
        'Krrish 4', // Not released yet
        'Ghanghang of Wasseypur', // Typo
    ]

    for (const title of deletions) {
        try {
            const result = await prisma.movie.deleteMany({
                where: { title: title }
            })
            if (result.count > 0) {
                console.log(`🗑️ Deleted "${title}"`)
            }
        } catch (e) {
            console.error(`Failed to delete ${title}:`, e.message)
        }
    }

    console.log('Done.')
    await prisma.$disconnect()
    await pool.end()
}

main().catch(e => {
    console.error(e)
    process.exit(1)
})

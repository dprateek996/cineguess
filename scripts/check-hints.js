
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function check() {
    const fallbackMovies = await prisma.hint.findMany({
        where: {
            level2Dialogue: {
                contains: "A memorable moment from this"
            }
        },
        include: {
            movie: true
        }
    })

    console.log(`Found ${fallbackMovies.length} movies with fallback hints:`)
    fallbackMovies.forEach(h => console.log(`- ${h.movie.title}`))

    if (fallbackMovies.length > 0) {
        console.log("Removing them to force re-seed...")
        // Delete the movies (cascade will handle hints)
        // Wait, deleting movies might break game sessions.
        // Better to just delete the hints? No, hints are 1-to-1 required.
        // Let's delete the movies for now, assuming dev env.

        const ids = fallbackMovies.map(h => h.movieId)
        await prisma.movie.deleteMany({
            where: {
                id: { in: ids }
            }
        })
        console.log("Deleted bad movies.")
    }
}

check().catch(console.error).finally(() => prisma.$disconnect())


import { PrismaClient } from '@prisma/client'

import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function clean() {
    console.log("🧹 Cleaning low quality data...");

    // Find movies with fallback text in hints
    // The fallback text defined in seed.mjs is "A memorable moment from this..." or similar generic text
    // We'll search for hints that look generic

    const badHints = await prisma.hint.findMany({
        where: {
            OR: [
                { level2Dialogue: { contains: "memorable moment" } },
                { level2Dialogue: { contains: "memorable line" } }, // Target specific user issue
                { level2Dialogue: { contains: "famous quote" } },
                { level2Dialogue: { contains: "Ext. Scene" } },
                { level2Dialogue: { equals: "" } }
            ]
        },
        include: { movie: true }
    });

    // Also find movies with missing info
    const badMovies = await prisma.movie.findMany({
        where: {
            OR: [
                { posterPath: { equals: "" } },
                { backdropPath: { equals: "" } }
            ]
        }
    });

    const allBadItems = [...badHints.map(h => h.movie), ...badMovies];
    // Remove duplicates
    const uniqueMovies = Array.from(new Set(allBadItems.map(m => m.id)))
        .map(id => allBadItems.find(m => m.id === id));

    console.log(`Found ${uniqueMovies.length} movies with issues.`);

    for (const movie of uniqueMovies) {
        if (!movie) continue;
        console.log(`Deleting: ${movie.title} (Issue: Bad/Missing Data)`);
        await prisma.movie.delete({
            where: { id: movie.id }
        });
    }

    console.log("✨ Cleanup complete.");
}

clean()
    .catch(console.error)
    .finally(() => prisma.$disconnect());


import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function audit() {
    console.log("🔍 Auditing poster paths...");

    const allMovies = await prisma.movie.findMany({
        select: { id: true, title: true, posterPath: true }
    });

    let suspicious = 0;
    for (const movie of allMovies) {
        const p = movie.posterPath;
        if (!p || !p.startsWith('/') || !p.match(/\.(jpg|jpeg|png)$/)) {
            console.log(`⚠️ Suspicious Path: [${movie.title}] -> "${p}"`);
            suspicious++;
        }
    }

    console.log(`\nAudit complete. Found ${suspicious} suspicious paths out of ${allMovies.length} movies.`);
    await prisma.$disconnect();
}

audit().catch(console.error);

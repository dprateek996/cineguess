
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function inspect() {
    const count = await prisma.movie.count();
    console.log(`Total Movies: ${count}`);

    const movies = await prisma.movie.findMany({
        take: 5,
        include: { hints: true }
    });

    console.log("\nSample Movies:");
    movies.forEach(m => {
        console.log(`[${m.id}] ${m.title} (${m.industry})`);
        console.log(`   Hint: ${m.hints?.level2Dialogue}`);
    });
}

inspect().catch(console.error).finally(() => prisma.$disconnect())

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    console.log("🔍 Verifying Production Database Access...");

    try {
        const total = await prisma.movie.count();
        console.log(`\n✅ Connected! Total Movies in DB: ${total}`);

        if (total === 0) {
            console.error("❌ CRITICAL: The database is empty. The app relies on Fallback Mode.");
            return;
        }

        // Simulate game start fetch
        const industry = "HOLLYWOOD";
        const count = await prisma.movie.count({ where: { industry } });
        console.log(`\n🎬 ${industry} Movies: ${count}`);

        if (count > 0) {
            const skip = Math.floor(Math.random() * count);
            const movie = await prisma.movie.findFirst({
                where: { industry },
                skip,
                include: { hints: true }
            });
            console.log(`✅ Successfully fetched random movie: "${movie.title}" (${movie.releaseYear})`);
            console.log(`   - Poster: ${movie.posterPath ? 'OK' : 'MISSING'}`);
            console.log(`   - Hints: ${movie.hints ? 'OK' : 'MISSING'}`);
        }

    } catch (e) {
        console.error("\n❌ Database Connection Failed:");
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

verify();

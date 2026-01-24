import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnose() {
    console.log("🔍 Diagnosing Database...");

    try {
        const total = await prisma.movie.count();
        console.log(`\n📊 Total Movies: ${total}`);

        const industries = ['HOLLYWOOD', 'BOLLYWOOD', 'ANIME', 'GLOBAL'];

        for (const industry of industries) {
            const count = await prisma.movie.count({ where: { industry } });
            const valid = await prisma.movie.count({
                where: {
                    industry,
                    posterPath: { not: '' },
                    backdropPath: { not: '' }
                }
            });
            console.log(`\n🎬 ${industry}:`);
            console.log(`   - Total: ${count}`);
            console.log(`   - Playable (Has Images): ${valid}`);

            if (count > 0 && valid === 0) {
                console.error(`   ⚠️  WARNING: You have ${count} movies but NONE have valid images! The game filters these out.`);
            }
        }
    } catch (e) {
        console.error("\n❌ Database Connection Failed:");
        console.error(e.message);
    } finally {
        await prisma.$disconnect();
    }
}

diagnose();

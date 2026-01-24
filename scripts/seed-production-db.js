import { PrismaClient } from '@prisma/client'
import { seedMovies } from '../src/services/movieSeeder.js'

// Need to handle dotenv manually since this is a standalone script
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()

async function main() {
    console.log("🚀 Starting Production Database Seed...");
    console.log("---------------------------------------");

    // Check connection first
    try {
        const count = await prisma.movie.count();
        console.log(`✅ Database Connected. Current Movies: ${count}`);
    } catch (e) {
        console.error("❌ Failed to connect to database. Check DATABASE_URL in .env");
        console.error(e);
        process.exit(1);
    }

    const industries = ['HOLLYWOOD', 'BOLLYWOOD', 'ANIME', 'GLOBAL'];

    for (const industry of industries) {
        console.log(`\n🌱 Seeding ${industry}...`);
        try {
            const added = await seedMovies(industry, 20); // Seed 20 of each
            console.log(`   ✅ Added ${added} new movies for ${industry}`);
        } catch (err) {
            console.error(`   ❌ Failed to seed ${industry}:`, err.message);
        }
    }

    const finalCount = await prisma.movie.count();
    console.log(`\n🎉 SEEDING COMPLETE!`);
    console.log(`📊 Final Total: ${finalCount} Movies`);
    console.log('---------------------------------------');

    await prisma.$disconnect();
}

main()
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })

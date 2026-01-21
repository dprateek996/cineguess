/**
 * seed-gold.mjs
 * 
 * Production seeder that uses the "Golden JSON" file.
 * Fast, reliable, and zero external dependencies.
 */
import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const GOLD_FILE = path.join(process.cwd(), 'src', 'data', 'movies-gold.json');

async function main() {
    console.log('🌱 Starting Golden Seeding...');

    // Check if gold file exists
    try {
        await fs.access(GOLD_FILE);
    } catch {
        console.error(`❌ Golden file not found: ${GOLD_FILE}`);
        console.error('   Run "node scripts/export-gold.mjs" first to create it.');
        process.exit(1);
    }

    const movies = JSON.parse(await fs.readFile(GOLD_FILE, 'utf-8'));
    console.log(`📦 Loaded ${movies.length} verified movies from JSON.`);

    // Optional: Clear database first?
    const clearDb = process.argv.includes('--clear'); // usage: node scripts/seed-gold.mjs --clear

    if (clearDb) {
        console.log('🗑️ Clearing existing data...');
        await prisma.hint.deleteMany({});
        await prisma.gameSession.deleteMany({});
        await prisma.dailyGame.deleteMany({});
        await prisma.movie.deleteMany({});
    }

    console.log('🚀 Inserting movies...');
    let inserted = 0;
    let skipped = 0;

    for (const movie of movies) {
        try {
            // Check if exists
            const existing = await prisma.movie.findUnique({
                where: { tmdbId: movie.tmdbId }
            });

            if (existing) {
                if (clearDb) {
                    // This shouldn't happen if we cleared, but just in case
                    console.log(`⚠️ Movie ${movie.title} shouldn't exist after clear??`);
                } else {
                    skipped++;
                    // Optional: Update existing movie?
                    // await prisma.movie.update(...) 
                }
                continue;
            }

            // Create movie and hints in one go
            await prisma.movie.create({
                data: {
                    tmdbId: movie.tmdbId,
                    title: movie.title,
                    releaseYear: movie.releaseYear,
                    industry: movie.industry,
                    genres: movie.genres,
                    posterPath: movie.posterPath,
                    backdropPath: movie.backdropPath,
                    hints: movie.hints ? {
                        create: {
                            level2Dialogue: movie.hints.level2Dialogue,
                            level3Emoji: movie.hints.level3Emoji,
                            level4Trivia: movie.hints.level4Trivia,
                            aiMetadata: movie.hints.aiMetadata || {}
                        }
                    } : undefined
                }
            });
            process.stdout.write('.');
            inserted++;
        } catch (err) {
            console.error(`\n❌ Failed to insert ${movie.title}:`, err.message);
        }
    }

    console.log('\n\n✨ Seeding Complete!');
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Skipped:  ${skipped}`);
    console.log(`   Total:    ${inserted + skipped}`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

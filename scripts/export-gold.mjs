/**
 * export-gold.mjs
 * 
 * Exports validated movies from the database into a "Golden JSON" file.
 * This file will serve as the single source of truth for the production database.
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

const OUTPUT_FILE = path.join(process.cwd(), 'src', 'data', 'movies-gold.json');

async function checkImageUrl(path) {
    if (!path) return false;
    try {
        const res = await fetch(`https://image.tmdb.org/t/p/w780${path}`, { method: 'HEAD' });
        return res.ok;
    } catch {
        return false;
    }
}

async function main() {
    console.log('🌟 Starting Golden Export...');

    // Fetch all movies with their hints
    const movies = await prisma.movie.findMany({
        include: {
            hints: true
        }
    });

    console.log(`\n📋 Found ${movies.length} candidates in database.`);
    const validatedMovies = [];
    const brokenMovies = [];

    // Verify every single movie image before exporting
    for (const movie of movies) {
        process.stdout.write(`Checking ${movie.title}... `);

        // 1. Basic field validation
        if (!movie.posterPath || !movie.backdropPath) {
            console.log('❌ Missing paths');
            brokenMovies.push({ title: movie.title, reason: 'Missing poster/backdrop path' });
            continue;
        }

        // 2. Validate Image URLs actually work (HEAD request)
        const posterOk = await checkImageUrl(movie.posterPath);
        const backdropOk = await checkImageUrl(movie.backdropPath);

        if (!posterOk || !backdropOk) {
            console.log('❌ Broken links');
            brokenMovies.push({ title: movie.title, reason: '404 Image URL' });
            continue;
        }

        console.log('✅ Valid');

        // Clean up data for export (remove DB-specific IDs if you want pure seed data, 
        // but keeping them is fine if we upsert by title/industry)
        validatedMovies.push({
            title: movie.title,
            releaseYear: movie.releaseYear,
            industry: movie.industry,
            genres: movie.genres,
            posterPath: movie.posterPath,
            backdropPath: movie.backdropPath,
            tmdbId: movie.tmdbId,
            hints: movie.hints ? {
                level2Dialogue: movie.hints.level2Dialogue,
                level3Emoji: movie.hints.level3Emoji,
                level4Trivia: movie.hints.level4Trivia,
                aiMetadata: movie.hints.aiMetadata
            } : null
        });
    }

    // Sort by industry then title
    validatedMovies.sort((a, b) => a.industry.localeCompare(b.industry) || a.title.localeCompare(b.title));

    // Write to file
    await fs.writeFile(OUTPUT_FILE, JSON.stringify(validatedMovies, null, 2));

    console.log('\n──────────────────────────────────────────');
    console.log(`🏆 Golden JSON Created: ${OUTPUT_FILE}`);
    console.log(`✅ Valid Movies: ${validatedMovies.length}`);
    console.log(`❌ Skipped/Broken: ${brokenMovies.length}`);
    console.log('──────────────────────────────────────────\n');

    if (brokenMovies.length > 0) {
        console.log('Skipped Movies details:', JSON.stringify(brokenMovies, null, 2));
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

#!/usr/bin/env node
/**
 * Fetch Better Backdrops Script
 * 
 * This script fetches additional backdrop images from TMDB for each movie
 * and picks a cleaner one (typically not the first one, which often has titles).
 * 
 * TMDB's images API returns multiple backdrops sorted by vote_average.
 * The second or third backdrop is often a cleaner scene without title text.
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const TMDB_API_KEY = process.env.TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

async function fetchMovieImages(tmdbId) {
    const url = `${BASE_URL}/movie/${tmdbId}/images`
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${TMDB_API_KEY}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`)
    }

    return response.json()
}

async function updateBackdrops() {
    console.log('\n🖼️ Fetching Better Backdrops')
    console.log('═'.repeat(50))

    if (!TMDB_API_KEY) {
        console.error('❌ TMDB_API_KEY is required!')
        process.exit(1)
    }

    const movies = await prisma.movie.findMany({
        orderBy: { title: 'asc' }
    })

    console.log(`📊 Found ${movies.length} movies to process`)

    let updated = 0
    let skipped = 0
    let failed = 0

    for (const movie of movies) {
        try {
            const images = await fetchMovieImages(movie.tmdbId)
            const backdrops = images.backdrops || []

            if (backdrops.length <= 1) {
                // No alternative backdrops available
                skipped++
                continue
            }

            // Strategy: Pick the 2nd or 3rd backdrop (index 1 or 2)
            // These are typically scene shots without title cards
            // Also filter for backdrops without text (iso_639_1 is null for no-text images)
            const cleanBackdrops = backdrops.filter(b => !b.iso_639_1)

            let bestBackdrop = null

            if (cleanBackdrops.length > 1) {
                // Prefer clean backdrops (no language/text overlay)
                // Pick the second one if available (first might still be promotional)
                bestBackdrop = cleanBackdrops[1] || cleanBackdrops[0]
            } else if (backdrops.length > 1) {
                // Fallback to regular backdrops, skip the first (most promotional)
                bestBackdrop = backdrops[1]
            }

            if (bestBackdrop && bestBackdrop.file_path !== movie.backdropPath) {
                await prisma.movie.update({
                    where: { id: movie.id },
                    data: {
                        backdropPath: bestBackdrop.file_path
                    }
                })
                console.log(`✅ "${movie.title}": Updated backdrop`)
                updated++
            } else {
                skipped++
            }

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 250))

        } catch (error) {
            console.log(`❌ "${movie.title}": ${error.message}`)
            failed++
        }
    }

    console.log('═'.repeat(50))
    console.log(`📊 Results:`)
    console.log(`  ✅ Updated: ${updated}`)
    console.log(`  ⏭️ Skipped: ${skipped}`)
    console.log(`  ❌ Failed: ${failed}`)
    console.log('═'.repeat(50))

    await prisma.$disconnect()
    await pool.end()
}

updateBackdrops().catch(async (e) => {
    console.error('❌ Script failed:', e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
})

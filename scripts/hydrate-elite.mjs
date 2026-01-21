#!/usr/bin/env node
/**
 * Elite Movie Library Hydration Script
 * 
 * Hydrates curated movies from elite-movies.js using TMDB and Gemini APIs.
 * 
 * Usage:
 *   npm run hydrate:elite -- --industry=HOLLYWOOD --genre=scifi
 *   npm run hydrate:elite -- --industry=BOLLYWOOD --genre=thriller
 *   npm run hydrate:elite -- --industry=ANIME --genre=all
 */

import dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ELITE_MOVIES } from '../src/data/elite-movies.js'
import { STATIC_HINTS } from '../src/data/static-hints.js'

// Database setup
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// TMDB setup
const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const geminiModel = process.env.GEMINI_API_KEY
    ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    : null

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2)
    const industryArg = args.find(arg => arg.startsWith('--industry'))
    const genreArg = args.find(arg => arg.startsWith('--genre'))
    const limitArg = args.find(arg => arg.startsWith('--limit'))
    const skipArg = args.find(arg => arg.startsWith('--skip'))

    return {
        industry: industryArg?.split('=')[1] || 'HOLLYWOOD',
        genre: genreArg?.split('=')[1] || 'scifi',
        limit: parseInt(limitArg?.split('=')[1] || '50'),
        skip: parseInt(skipArg?.split('=')[1] || '0')
    }
}

// Fetch from TMDB
async function fetchFromTMDB(endpoint, params = {}) {
    const url = new URL(endpoint)
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))

    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': `Bearer ${TMDB_API_KEY}`,
            'Content-Type': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error(`TMDB API Error: ${response.status}`)
    }

    return response.json()
}

// Search TMDB for a movie by title
async function searchTMDB(query, industry) {
    const params = { query, page: '1' }

    // Add language filter for Bollywood
    if (industry === 'BOLLYWOOD') {
        params.language = 'hi-IN'
    }

    const data = await fetchFromTMDB(`${TMDB_BASE_URL}/search/movie`, params)
    return data.results?.[0] || null
}

// Get movie details from TMDB
async function getMovieDetails(tmdbId) {
    return fetchFromTMDB(`${TMDB_BASE_URL}/movie/${tmdbId}`)
}

// Generate hints prompt (enhanced for iconic dialogues)
function generateHintsPrompt(title, year, industry) {
    return `You are a movie hint generator for a guessing game called CineGuess.

Generate exactly 4 hints for the ${industry} film "${title}" (${year}).

STRICT RULES:
1. DO NOT mention the movie title or any main character names in any hint
2. Each hint should progressively make it easier to guess
3. Return ONLY valid JSON, no markdown or extra text

IMPORTANT FOR DIALOGUE:
- Choose the MOST ICONIC, INSTANTLY RECOGNIZABLE quote that fans would immediately associate with this film
- The dialogue should be famous enough that most movie fans would recognize it
- Do NOT include character names in the dialogue

Return in this EXACT JSON format:
{
  "dialogue": "The most famous, iconic quote from this movie (no character names)",
  "emoji": "3-4 emojis that represent the plot/theme",
  "trivia": "An interesting behind-the-scenes fact about production or filming",
  "location": "The main setting or key filming location"
}

Generate hints for "${title}" (${year}):`
}

// Generate hints using Gemini or static hints
async function generateHints(title, year, industry) {
    // Check static hints first
    if (STATIC_HINTS[title]) {
        console.log(`    ⚡ Using static hint for "${title}"`)
        return STATIC_HINTS[title]
    }

    if (!geminiModel) {
        return getFallbackHints(title, year)
    }

    // Retry logic for API rate limits
    const generateWithRetry = async (retries = 3, delay = 5000) => {
        try {
            return await geminiModel.generateContent(generateHintsPrompt(title, year, industry))
        } catch (error) {
            if (error.status === 429 && retries > 0) {
                console.log(`    ⏳ Rate limit hit, waiting ${delay / 1000}s...`)
                await new Promise(resolve => setTimeout(resolve, delay))
                return generateWithRetry(retries - 1, delay * 2)
            }
            throw error
        }
    }

    try {
        const result = await generateWithRetry(3, 10000)
        const text = result.response.text().replace(/```json\n?|```/g, '').trim()
        const hints = JSON.parse(text)

        if (!hints.dialogue || !hints.emoji || !hints.trivia || !hints.location) {
            throw new Error('Invalid hint structure')
        }

        return hints
    } catch (e) {
        console.error(`    ❌ Gemini Error:`, e.message)
        return getFallbackHints(title, year)
    }
}

// Fallback hints when API fails
function getFallbackHints(title, year) {
    return {
        dialogue: `A memorable quote from this ${year} film.`,
        emoji: '🎬🎭🍿',
        trivia: `This movie was released in ${year} and became a fan favorite.`,
        location: 'A significant location from the story.'
    }
}

// Hydrate a single movie
async function hydrateMovie(title, industry) {
    try {
        // Search for the movie on TMDB
        const searchResult = await searchTMDB(title, industry)

        if (!searchResult) {
            console.log(`    ⚠️ Not found on TMDB: "${title}"`)
            return null
        }

        const tmdbId = searchResult.id

        // Check if already exists
        const existing = await prisma.movie.findUnique({ where: { tmdbId } })
        if (existing) {
            // Check if we need to backfill popularity data
            if (!existing.popularity || existing.popularity === 0) {
                const details = await getMovieDetails(tmdbId)
                await prisma.movie.update({
                    where: { id: existing.id },
                    data: {
                        popularity: details.popularity || 0,
                        voteCount: details.vote_count || 0
                    }
                })
                console.log(`    ↻ Updated stats: "${title}"`)
            } else {
                console.log(`    ⏭️ Already exists: "${title}"`)
            }
            return existing
        }

        // Get full details
        const details = await getMovieDetails(tmdbId)

        if (!details.poster_path || !details.backdrop_path) {
            console.log(`    ⚠️ Missing images for: "${title}"`)
            return null
        }

        const releaseYear = details.release_date
            ? new Date(details.release_date).getFullYear()
            : 0

        // Generate AI hints
        console.log(`    🤖 Generating hints...`)
        const hints = await generateHints(title, releaseYear, industry)

        // Save to database
        const movie = await prisma.movie.create({
            data: {
                tmdbId,
                title: details.title,
                releaseYear,
                industry,
                genres: details.genres?.map(g => g.name) || [],
                posterPath: details.poster_path,
                backdropPath: details.backdrop_path,
                popularity: details.popularity || 0,
                voteCount: details.vote_count || 0,
                hints: {
                    create: {
                        level1Blur: 50,
                        level2Dialogue: hints.dialogue,
                        level3Emoji: hints.emoji,
                        level4Trivia: hints.trivia,
                        aiMetadata: {
                            location: hints.location,
                            generatedAt: new Date().toISOString()
                        }
                    }
                }
            },
            include: { hints: true }
        })

        console.log(`    ✅ Hydrated: "${movie.title}" (${movie.releaseYear})`)
        return movie

    } catch (error) {
        console.error(`    ❌ Failed to hydrate "${title}":`, error.message)
        return null
    }
}

// Main function
async function main() {
    const { industry, genre, limit, skip } = parseArgs()

    console.log('\n🎬 Elite Movie Library Hydration')
    console.log('═'.repeat(50))
    console.log(`📂 Industry: ${industry}`)
    console.log(`🎭 Genre: ${genre}`)
    console.log(`📊 Limit: ${limit} | Skip: ${skip}`)
    console.log('═'.repeat(50))

    // Validate API keys
    if (!TMDB_API_KEY) {
        console.error('❌ Missing TMDB_API_KEY')
        process.exit(1)
    }

    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️ Missing GEMINI_API_KEY - will use fallback hints')
    }

    // Get movie list
    const industryMovies = ELITE_MOVIES[industry]
    if (!industryMovies) {
        console.error(`❌ Invalid industry: ${industry}`)
        console.log('Available: HOLLYWOOD, BOLLYWOOD, ANIME')
        process.exit(1)
    }

    const genreMovies = industryMovies[genre]
    if (!genreMovies) {
        console.error(`❌ Invalid genre: ${genre}`)
        console.log(`Available for ${industry}:`, Object.keys(industryMovies).join(', '))
        process.exit(1)
    }

    const moviesToProcess = genreMovies.slice(skip, skip + limit)
    console.log(`\n🎯 Processing ${moviesToProcess.length} movies...\n`)

    let successCount = 0
    let skipCount = 0
    let failCount = 0

    for (let i = 0; i < moviesToProcess.length; i++) {
        const title = moviesToProcess[i]
        console.log(`[${i + 1}/${moviesToProcess.length}] 🎥 "${title}"`)

        const result = await hydrateMovie(title, industry)

        if (result) {
            if (result.id) successCount++
            else skipCount++
        } else {
            failCount++
        }

        // Rate limiting: 5 second delay between movies (safe for free tier)
        if (i < moviesToProcess.length - 1) {
            console.log('⏳ Waiting 5s...');
            await new Promise(resolve => setTimeout(resolve, 5000))
        }
    }

    console.log('\n' + '═'.repeat(50))
    console.log('📊 HYDRATION SUMMARY')
    console.log('═'.repeat(50))
    console.log(`✅ Successfully hydrated: ${successCount}`)
    console.log(`⏭️ Already existed: ${skipCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log('═'.repeat(50))

    // Show total database count
    const totalCount = await prisma.movie.count()
    console.log(`\n📚 Total movies in database: ${totalCount}`)
}

main()
    .catch(e => {
        console.error('Fatal error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })

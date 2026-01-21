#!/usr/bin/env node
/**
 * Advanced Database Seed Script
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Create Prisma client with pg adapter
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Setup
const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
// Use 2.0-flash as confirmed available
const geminiModel = process.env.GEMINI_API_KEY ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) : null

// Curated Lists
const CURATED_LISTS = {
    HOLLYWOOD: {
        movies: [
            "Interstellar", "Inception", "The Dark Knight", "Avengers: Endgame",
            "Pulp Fiction", "Fight Club", "The Matrix", "Goodfellas",
            "The Shawshank Redemption", "Forrest Gump", "Titanic", "Avatar",
            "The Godfather", "Joker", "Spider-Man: No Way Home",
            "Top Gun: Maverick", "Barbie", "Oppenheimer", "The Truman Show",
            "Blade Runner 2049", "The Wolf of Wall Street", "Se7en", "Gladiator",
            "The Silence of the Lambs", "Parasite"
        ],
        shows: [
            "Breaking Bad", "Game of Thrones", "Stranger Things", "Succession",
            "The Bear", "The Boys", "The Office", "Friends", "Black Mirror",
            "The Mandalorian", "Chernobyl", "Better Call Saul", "True Detective"
        ]
    },
    BOLLYWOOD: {
        movies: [
            "3 Idiots", "Dangal", "Sholay", "Dilwale Dulhania Le Jayenge",
            "Lagaan", "Gangs of Wasseypur", "Zindagi Na Milegi Dobara",
            "Queen", "Andhadhun", "Drishyam", "PK", "Bajrangi Bhaijaan",
            "RRR", "Baahubali: The Beginning", "Swades", "Chak De! India",
            "Rang De Basanti", "Barfi!", "Article 15", "Tumbbad"
        ],
        shows: [
            "Sacred Games", "Mirzapur", "The Family Man", "Panchayat",
            "Scam 1992", "Made in Heaven", "Kota Factory", "Paatal Lok",
            "Farzi", "Rocket Boys"
        ]
    },
    ANIME: {
        movies: [
            "Spirited Away", "Your Name", "A Silent Voice", "Princess Mononoke",
            "Akira", "Grave of the Fireflies", "Howl's Moving Castle",
            "The Boy and the Heron", "Suzume", "Demon Slayer: Mugen Train"
        ],
        shows: [
            "Attack on Titan", "Death Note", "Fullmetal Alchemist: Brotherhood",
            "One Piece", "Naruto", "Dragon Ball Z", "Cowboy Bebop",
            "Neon Genesis Evangelion", "Demon Slayer", "Jujutsu Kaisen",
            "Chainsaw Man", "Cyberpunk: Edgerunners", "Vinland Saga",
            "Hunter x Hunter", "Steins;Gate"
        ]
    }
}

// Fetch helper
async function fetchFromTMDB(endpoint, params = {}) {
    const url = new URL(endpoint)
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value))
    const response = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${TMDB_API_KEY}`, 'Content-Type': 'application/json' }
    })
    if (!response.ok) throw new Error(`TMDB API Error: ${response.status}`)
    return response.json()
}

// Search TMDB
async function searchTMDB(query, type = 'movie', industry = 'HOLLYWOOD') {
    const endpoint = `${TMDB_BASE_URL}/search/${type}`
    const params = { query, page: '1' }
    const data = await fetchFromTMDB(endpoint, params)
    return data.results?.[0] || null
}

// Generate Hints Prompt
const generateHintsPrompt = (title, year, type) => `
Generate 4 hints for the ${type} "${title}" (${year}).
RULES:
1. No title/character names in hints.
2. Valid JSON only.
FORMAT:
{
  "dialogue": "Famous quote (no names)",
  "emoji": "3-4 plot emojis",
  "trivia": "Interesting production fact",
  "location": "Key setting/location"
}`

import { STATIC_HINTS } from '../src/data/static-hints.js'

async function generateHints(title, year, type) {
    // 1. Check Static Cache First (Instant, Perfect Quality)
    if (STATIC_HINTS[title]) {
        console.log(`    ⚡ Using Static Hint for "${title}"`)
        return STATIC_HINTS[title]
    }

    if (!geminiModel) return getFallbackHints(title, year)

    // 2. Retry logic for API (for non-static movies)
    const generateWithRetry = async (retries = 3, delay = 5000) => {
        try {
            return await geminiModel.generateContent(generateHintsPrompt(title, year, type));
        } catch (error) {
            if (error.status === 429 && retries > 0) {
                console.log(`    ⏳ Rate limit hit, waiting ${delay / 1000}s...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return generateWithRetry(retries - 1, delay * 2);
            }
            throw error;
        }
    };

    try {
        const result = await generateWithRetry(3, 10000);
        const text = result.response.text().replace(/```json\n?|```/g, '').trim()
        return JSON.parse(text)
    } catch (e) {
        console.error(`    ❌ Gemini Error:`, e.message);
        console.log(`    ⚠️ AI Hint generation failed for ${title}, using fallback.`)
        return getFallbackHints(title, year)
    }
}

function getFallbackHints(title, year) {
    return {
        dialogue: `A memorable moment from this ${year} classic.`,
        emoji: '🎬🎭🍿',
        trivia: `Released in ${year}, this title captivated audiences.`,
        location: 'The main setting of the story.'
    }
}

// Hydrate (Save) to DB
async function hydrate(item, type, industry) {
    const tmdbId = type === 'tv' ? -item.id : item.id
    const title = item.title || item.name
    const releaseDate = item.release_date || item.first_air_date
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 0
    const genres = []

    // Check existence
    const existing = await prisma.movie.findUnique({ where: { tmdbId } })
    if (existing) {
        // console.log(`  ⏭️  Skipping existing: ${title}`)
        return
    }

    // Get details for images
    const details = await fetchFromTMDB(`${TMDB_BASE_URL}/${type}/${item.id}`)
    const posterPath = details.poster_path
    const backdropPath = details.backdrop_path

    if (!posterPath || !backdropPath) return

    console.log(`  ✨ Seeding [${type.toUpperCase()}] ${title}`)

    const hints = await generateHints(title, year, type === 'tv' ? 'TV Show' : 'Movie')

    // Save
    await prisma.movie.create({
        data: {
            tmdbId,
            title,
            releaseYear: year,
            industry,
            genres,
            posterPath,
            backdropPath,
            hints: {
                create: {
                    level1Blur: 60,
                    level2Dialogue: hints.dialogue, // This will be the high quality hint if Gemini succeeds
                    level3Emoji: hints.emoji,
                    level4Trivia: hints.trivia,
                    aiMetadata: { location: hints.location }
                }
            }
        }
    })
}

// Main Logic
async function seed() {
    console.log(`\n🌱 Starting Advanced Cureted Seed...`)

    if (!TMDB_API_KEY) {
        process.exit(1)
    }

    const industries = ['HOLLYWOOD', 'BOLLYWOOD', 'ANIME']

    for (const industry of industries) {
        console.log(`\n--- Processing ${industry} ---`)
        const list = CURATED_LISTS[industry]

        // 1. Seed Curated Movies
        for (const title of list.movies) {
            await new Promise(r => setTimeout(r, 2000)); // Increased Base Delay
            const movie = await searchTMDB(title, 'movie')
            if (movie) await hydrate(movie, 'movie', industry)
        }

        // 2. Seed Curated Shows
        for (const title of list.shows) {
            await new Promise(r => setTimeout(r, 2000));
            const show = await searchTMDB(title, 'tv')
            if (show) await hydrate(show, 'tv', industry)
        }

        // 3. Discover
        // ... (truncated simple discovery for brevity, can re-add if needed but curated is priority)
    }

    console.log("\n✅ Seeding Complete!")
}

seed()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })

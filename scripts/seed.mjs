#!/usr/bin/env node
/**
 * Advanced Database Seed Script
 * - Curated Lists (Top 25, Cult Classics, TV Shows)
 * - Discovery Mode with Randomness
 * - Support for TV Shows (mapped to Movie schema with negative IDs)
 * 
 * Usage:
 *   node scripts/seed.mjs --all --count=20
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
const geminiModel = process.env.GEMINI_API_KEY ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null

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

    // Add simple filters if possible (mostly post-filtering needed for regions)
    const data = await fetchFromTMDB(endpoint, params)
    return data.results?.[0] || null // Return best match
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

async function generateHints(title, year, type) {
    if (!geminiModel) return getFallbackHints(title, year)
    try {
        const result = await geminiModel.generateContent(generateHintsPrompt(title, year, type))
        const text = result.response.text().replace(/```json\n?|```/g, '').trim()
        return JSON.parse(text)
    } catch (e) {
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
    const tmdbId = type === 'tv' ? -item.id : item.id // Negative IDs for TV shows to avoid collision
    const title = item.title || item.name
    const releaseDate = item.release_date || item.first_air_date
    const year = releaseDate ? new Date(releaseDate).getFullYear() : 0
    const genres = [] // Simplified for now

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

    if (!posterPath || !backdropPath) return // Skip if no images

    console.log(`  ✨ Seeding [${type.toUpperCase()}] ${title}`)

    // Hints
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
                    level1Blur: 60, // Higher blur as requested
                    level2Dialogue: hints.dialogue,
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
        console.error("❌ TMDB_API_KEY missing in environment.")
        process.exit(1)
    }

    const industries = ['HOLLYWOOD', 'BOLLYWOOD', 'ANIME'] // Default to all for this curated run

    for (const industry of industries) {
        console.log(`\n--- Processing ${industry} ---`)
        const list = CURATED_LISTS[industry]

        // 1. Seed Curated Movies
        for (const title of list.movies) {
            await new Promise(r => setTimeout(r, 1000)); // Rate limit
            const movie = await searchTMDB(title, 'movie')
            if (movie) await hydrate(movie, 'movie', industry)
        }

        // 2. Seed Curated Shows
        for (const title of list.shows) {
            await new Promise(r => setTimeout(r, 1000)); // Rate limit
            const show = await searchTMDB(title, 'tv')
            if (show) await hydrate(show, 'tv', industry)
        }

        // 3. Discover Random "Underrated/Cult" (High rated, random page)
        // Movies
        const randomPage = Math.floor(Math.random() * 5) + 1
        let discoverParams = {
            page: randomPage,
            'vote_average.gte': '7.5', // Good quality
            'vote_count.gte': '300',   // Some popularity but maybe not massive
            sort_by: 'vote_average.desc'
        }

        if (industry === 'BOLLYWOOD') {
            discoverParams.with_original_language = 'hi'
        } else if (industry === 'HOLLYWOOD') {
            discoverParams.with_original_language = 'en'
        } else if (industry === 'ANIME') {
            discoverParams.with_genres = '16'
            discoverParams.with_original_language = 'ja'
        }

        await new Promise(r => setTimeout(r, 1000)); // Rate limit
        const discovered = await fetchFromTMDB(`${TMDB_BASE_URL}/discover/movie`, discoverParams)
        // Seed first 5 from discovery
        for (const item of discovered.results.slice(0, 5)) {
            await new Promise(r => setTimeout(r, 1000)); // Rate limit
            await hydrate(item, 'movie', industry)
        }
    }

    console.log("\n✅ Seeding Complete!")
}

seed()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })

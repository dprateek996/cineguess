#!/usr/bin/env node
/**
 * Database Seed Script
 * Run this to populate your database with movies and AI-generated hints
 * 
 * Usage:
 *   node scripts/seed.mjs
 *   node scripts/seed.mjs --industry=BOLLYWOOD --count=10
 *   node scripts/seed.mjs --all --count=15
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Create Prisma client with pg adapter
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// TMDB API setup
const TMDB_API_KEY = process.env.TMDB_API_KEY || ''
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

// Gemini AI setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const geminiModel = process.env.GEMINI_API_KEY
    ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    : null

// Generate hints prompt
const generateHintsPrompt = (movieTitle, releaseYear, industry) => {
    return `You are a movie hint generator for a guessing game called CineGuess.
  
Generate exactly 4 hints for the movie "${movieTitle}" (${releaseYear}) from ${industry} cinema.

STRICT RULES:
1. DO NOT mention the movie title or any main character names
2. Each hint should progressively make it easier to guess
3. Return ONLY valid JSON, no markdown or extra text

Return in this EXACT JSON format:
{
  "dialogue": "A famous quote from the movie (without character name)",
  "emoji": "3-4 emojis that represent the plot",
  "trivia": "An obscure fact about production/filming",
  "location": "A key filming location or setting in the movie"
}

Now generate hints for "${movieTitle}" (${releaseYear}):
`
}

// Fetch from TMDB
async function fetchFromTMDB(endpoint, params = {}) {
    const url = new URL(endpoint)
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': `Bearer ${TMDB_API_KEY}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
}

// Discover movies by industry
async function discoverMovies(industry, page = 1) {
    const params = {
        page: page.toString(),
        'vote_count.gte': '500',
        sort_by: 'popularity.desc',
    }

    if (industry === 'BOLLYWOOD') {
        params.with_original_language = 'hi'
    } else if (industry === 'HOLLYWOOD') {
        params.with_original_language = 'en'
        params.region = 'US'
    } else if (industry === 'ANIME') {
        params.with_original_language = 'ja'
        params.with_genres = '16' // Animation genre
    } else if (industry === 'GLOBAL') {
        // Just get popular movies from any region
        params.region = 'all'
    }

    const data = await fetchFromTMDB(`${TMDB_BASE_URL}/discover/movie`, params)
    return data.results
}

// Get movie details
async function getMovieDetails(movieId) {
    return fetchFromTMDB(`${TMDB_BASE_URL}/movie/${movieId}`)
}

// Generate AI hints using Gemini
async function generateHints(movieTitle, releaseYear, industry) {
    try {
        if (!geminiModel) {
            console.log('    ⚠️  No Gemini API key - using fallback hints')
            return getFallbackHints(movieTitle, releaseYear)
        }

        const prompt = generateHintsPrompt(movieTitle, releaseYear, industry)
        const result = await geminiModel.generateContent(prompt)
        const response = result.response.text()

        // Clean the response
        const cleanedResponse = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()

        const hints = JSON.parse(cleanedResponse)

        if (!hints.dialogue || !hints.emoji || !hints.trivia || !hints.location) {
            throw new Error('Invalid hint structure')
        }

        return hints
    } catch (error) {
        console.log(`    ⚠️  Gemini failed for "${movieTitle}": ${error.message}`)
        return getFallbackHints(movieTitle, releaseYear)
    }
}

// Fallback hints when Gemini is unavailable
function getFallbackHints(movieTitle, releaseYear) {
    return {
        dialogue: `A memorable line from this ${releaseYear} film`,
        emoji: '🎬🎭🎪',
        trivia: `This movie was released in ${releaseYear}`,
        location: 'A significant location in the story',
    }
}

// Hydrate a single movie
async function hydrateMovie(tmdbId, industry) {
    // Check if already exists
    const existing = await prisma.movie.findUnique({
        where: { tmdbId },
    })

    if (existing) {
        console.log(`  ⏭️  Already exists: ${existing.title}`)
        return existing
    }

    // Fetch from TMDB
    const tmdbMovie = await getMovieDetails(tmdbId)
    const releaseYear = new Date(tmdbMovie.release_date).getFullYear()

    console.log(`  🎬 Generating hints for: ${tmdbMovie.title} (${releaseYear})`)

    // Generate AI hints
    const hints = await generateHints(tmdbMovie.title, releaseYear, industry)

    // Store in database
    const movie = await prisma.movie.create({
        data: {
            tmdbId: tmdbMovie.id,
            title: tmdbMovie.title,
            releaseYear,
            industry,
            genres: tmdbMovie.genres?.map((g) => g.name) || [],
            posterPath: tmdbMovie.poster_path || '',
            backdropPath: tmdbMovie.backdrop_path || '',
            hints: {
                create: {
                    level1Blur: 45,
                    level2Dialogue: hints.dialogue,
                    level3Emoji: hints.emoji,
                    level4Trivia: hints.trivia,
                    aiMetadata: {
                        location: hints.location,
                        generatedAt: new Date().toISOString(),
                    },
                },
            },
        },
        include: { hints: true },
    })

    console.log(`  ✅ Saved: ${movie.title}`)
    return movie
}

// Main seed function
async function seed() {
    const args = process.argv.slice(2)

    // Parse arguments
    const industryArg = args.find(arg => arg.startsWith('--industry='))
    const countArg = args.find(arg => arg.startsWith('--count='))
    const allFlag = args.includes('--all')

    const industries = allFlag
        ? ['HOLLYWOOD', 'BOLLYWOOD', 'ANIME']
        : [industryArg?.split('=')[1] || 'HOLLYWOOD']

    const count = parseInt(countArg?.split('=')[1] || '15')

    console.log('\n🎬 CineGuess Database Seeder')
    console.log('═'.repeat(40))
    console.log(`📊 Industries: ${industries.join(', ')}`)
    console.log(`🎯 Movies per industry: ${count}`)
    console.log(`🔑 TMDB API: ${TMDB_API_KEY ? '✅ Configured' : '❌ Missing'}`)
    console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '⚠️ Missing (using fallback hints)'}`)
    console.log('═'.repeat(40))

    if (!TMDB_API_KEY) {
        console.error('\n❌ TMDB_API_KEY is required!')
        process.exit(1)
    }

    let totalSeeded = 0

    for (const industry of industries) {
        console.log(`\n🎭 Seeding ${industry}...`)

        try {
            const movies = await discoverMovies(industry, 1)
            console.log(`  📥 Found ${movies.length} movies from TMDB`)

            for (let i = 0; i < Math.min(count, movies.length); i++) {
                try {
                    await hydrateMovie(movies[i].id, industry)
                    totalSeeded++

                    // Rate limiting: wait between API calls
                    if (geminiModel) {
                        await new Promise(resolve => setTimeout(resolve, 1500))
                    } else {
                        await new Promise(resolve => setTimeout(resolve, 500))
                    }
                } catch (error) {
                    console.error(`  ❌ Failed: ${movies[i].title} - ${error.message}`)
                }
            }
        } catch (error) {
            console.error(`  ❌ Failed to fetch ${industry} movies: ${error.message}`)
        }
    }

    // Show final stats
    const stats = await prisma.movie.groupBy({
        by: ['industry'],
        _count: { id: true },
    })

    console.log('\n' + '═'.repeat(40))
    console.log('📊 Database Statistics:')
    stats.forEach(stat => {
        console.log(`  ${stat.industry}: ${stat._count.id} movies`)
    })
    console.log('═'.repeat(40))
    console.log(`\n✅ Seeding complete! Added ${totalSeeded} movies.`)

    await prisma.$disconnect()
    await pool.end()
}

seed().catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
})

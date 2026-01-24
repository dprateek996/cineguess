#!/usr/bin/env node
/**
 * Regenerate Movie Hints Script
 * Run this to regenerate AI hints for movies that have placeholder dialogue
 * 
 * Usage:
 *   node scripts/regenerate-hints.mjs
 *   node scripts/regenerate-hints.mjs --all (regenerate all, even if hints exist)
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

// Gemini AI setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const geminiModel = process.env.GEMINI_API_KEY
    ? genAI.getGenerativeModel({ model: 'gemini-flash-latest' })
    : null

// Generate hints prompt - improved for better dialogue quotes
const generateHintsPrompt = (movieTitle, releaseYear, industry) => {
    return `You are a movie hint generator for a guessing game called CineGuess.

Generate exactly 4 hints for the movie "${movieTitle}" (${releaseYear}) from ${industry} cinema.

STRICT RULES:
1. DO NOT mention the movie title or any main character names in the hints
2. For the dialogue, provide an ACTUAL famous quote from the movie that fans would recognize
3. The dialogue should be a real, memorable line that was actually spoken in the film
4. Return ONLY valid JSON, no markdown or extra text

Return in this EXACT JSON format:
{
  "dialogue": "An actual famous quote from this movie (something a character really said)",
  "emoji": "3-4 emojis that represent the plot without giving it away",
  "trivia": "An obscure but interesting fact about production/filming",
  "location": "A key filming location or setting in the movie"
}

Examples of GOOD dialogue quotes:
- "I'll be back" (from Terminator)
- "May the Force be with you" (from Star Wars)
- "You talking to me?" (from Taxi Driver)
- "Here's looking at you, kid" (from Casablanca)

Now generate hints for "${movieTitle}" (${releaseYear}):
`
}


// Generate AI hints using Gemini with retry logic
async function generateHints(movieTitle, releaseYear, industry) {
    if (!geminiModel) {
        throw new Error('Gemini API key not configured')
    }

    const prompt = generateHintsPrompt(movieTitle, releaseYear, industry)

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
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
            const isRateLimit = error.message.includes('429') || error.message.includes('Quota exceeded')

            if (isRateLimit && attempt < 3) {
                const waitTime = attempt * 10000 // 10s, 20s
                console.log(`     ⚠️ Rate limit hit. Waiting ${waitTime / 1000}s before retry ${attempt + 1}...`)
                await new Promise(resolve => setTimeout(resolve, waitTime))
                continue
            }
            throw error
        }
    }
}

// Check if hint needs regeneration (contains placeholder text)
function needsRegeneration(hint) {
    if (!hint) return true

    const placeholderPatterns = [
        /^A memorable (line|quote) from this/i,
        /^A famous quote from this/i,
        /\d{4} film$/,
        /^🎬🎭🎪$/,
        /^Dialogue coming soon/i
    ]

    const dialogue = hint.level2Dialogue || ''
    const emoji = hint.level3Emoji || ''

    return placeholderPatterns.some(pattern =>
        pattern.test(dialogue) || pattern.test(emoji)
    )
}

// Main regeneration function
async function regenerateHints() {
    const args = process.argv.slice(2)
    const forceAll = args.includes('--all')

    console.log('\n🔄 CineGuess Hint Regenerator')
    console.log('═'.repeat(40))
    console.log(`🤖 Gemini AI: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`)
    console.log(`📋 Mode: ${forceAll ? 'Regenerate ALL hints' : 'Only placeholder hints'}`)
    console.log('═'.repeat(40))

    if (!geminiModel) {
        console.error('\n❌ GEMINI_API_KEY is required to regenerate hints!')
        process.exit(1)
    }

    // Get all movies with their hints
    const movies = await prisma.movie.findMany({
        include: { hints: true },
        orderBy: { title: 'asc' }
    })

    console.log(`\n📊 Found ${movies.length} movies in database`)

    let regenerated = 0
    let skipped = 0
    let failed = 0

    for (const movie of movies) {
        const shouldRegenerate = forceAll || needsRegeneration(movie.hints)

        if (!shouldRegenerate) {
            skipped++
            process.stdout.write('.') // Minimal output for skips
            continue
        }

        console.log(`\n  🔄 Regenerating: ${movie.title} (${movie.releaseYear})`)

        try {
            const hints = await generateHints(movie.title, movie.releaseYear, movie.industry)

            // Update or create hints
            if (movie.hints) {
                await prisma.hint.update({
                    where: { id: movie.hints.id },
                    data: {
                        level2Dialogue: hints.dialogue,
                        level3Emoji: hints.emoji,
                        level4Trivia: hints.trivia,
                        aiMetadata: {
                            location: hints.location,
                            regeneratedAt: new Date().toISOString(),
                        },
                    }
                })
            } else {
                await prisma.hint.create({
                    data: {
                        movieId: movie.id,
                        level1Blur: 45,
                        level2Dialogue: hints.dialogue,
                        level3Emoji: hints.emoji,
                        level4Trivia: hints.trivia,
                        aiMetadata: {
                            location: hints.location,
                            generatedAt: new Date().toISOString(),
                        },
                    }
                })
            }

            console.log(`     ✅ "${hints.dialogue.substring(0, 50)}..."`)
            regenerated++

            // Rate limiting - INCREASED to 4s for safety
            await new Promise(resolve => setTimeout(resolve, 4000))
        } catch (error) {
            console.log(`     ❌ Failed: ${error.message}`)
            failed++
        }
    }

    console.log('\n\n' + '═'.repeat(40))
    console.log('📊 Results:')
    console.log(`  ✅ Regenerated: ${regenerated}`)
    console.log(`  ⏭️  Skipped: ${skipped}`)
    console.log(`  ❌ Failed: ${failed}`)
    console.log('═'.repeat(40))

    await prisma.$disconnect()
    await pool.end()
}

regenerateHints().catch(async (e) => {
    console.error('❌ Regeneration failed:', e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
})


import { PrismaClient } from '@prisma/client'
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

dotenv.config()

// Recreate the client instantiation logic locally
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' })

async function generateHints(title, year, industry) {
    const prompt = `You are a movie hint generator for a guessing game called CineGuess.
  
    Generate exactly 4 hints for the movie "${title}" (${year}) from ${industry} cinema.
  
    STRICT RULES:
    1. DO NOT mention the movie title or any main character names
    2. Each hint should progressively make it easier to guess
    3. Return ONLY valid JSON, no markdown or extra text
  
    Return in this EXACT JSON format:
    {
      "dialogue": "The MOST ICONIC, INSTANTLY RECOGNIZABLE quote that fans would immediately associate with this film (no character names)",
      "emoji": "3-4 emojis that represent the plot",
      "trivia": "An obscure fact about production/filming",
      "location": "A key filming location or setting in the movie"
    }
    `

    let retries = 0
    while (retries < 5) {
        try {
            const result = await model.generateContent(prompt)
            const response = result.response.text()
            const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            return JSON.parse(cleaned)
        } catch (e) {
            if (e.message.includes('429')) {
                console.log(`⚠️ Rate limit hit for ${title}. Waiting 30s... (Attempt ${retries + 1}/5)`)
                await new Promise(r => setTimeout(r, 30000))
                retries++
                continue
            }
            console.error(`Failed to generate for ${title}:`, e.message)
            return null
        }
    }
    return null
}

async function main() {
    console.log('Scanning for broken hints...')

    // Find all hints that look like the fallback text
    const brokenHints = await prisma.hint.findMany({
        where: {
            level2Dialogue: {
                startsWith: 'A memorable quote from this'
            }
        },
        include: {
            movie: true
        }
    })

    console.log(`Found ${brokenHints.length} movies with broken hints.`)

    for (const [index, hint] of brokenHints.entries()) {
        const movie = hint.movie
        console.log(`[${index + 1}/${brokenHints.length}] Fixing: ${movie.title} (${movie.releaseYear})...`)

        try {
            const newHints = await generateHints(movie.title, movie.releaseYear, movie.industry)

            if (newHints && newHints.dialogue) {
                await prisma.hint.update({
                    where: { id: hint.id },
                    data: {
                        level2Dialogue: newHints.dialogue,
                        level3Emoji: newHints.emoji,
                        level4Trivia: newHints.trivia,
                        aiMetadata: {
                            location: newHints.location,
                            fixedAt: new Date().toISOString()
                        }
                    }
                })
                console.log(`✅ Fixed ${movie.title}`)
            } else {
                console.log(`❌ Failed to regenerate for ${movie.title}`)
            }

            // Standard delay to avoid hitting limits immediately
            await new Promise(r => setTimeout(r, 10000))

        } catch (err) {
            console.error(`Error fixing ${movie.title}:`, err)
        }
    }

    console.log('Done!')
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })

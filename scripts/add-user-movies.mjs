
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const moviesToAdd = [
    { title: "Dilwale Dulhania Le Jayenge", year: 1995, iconic: "The yellow mustard fields and the train scene." },
    { title: "Sholay", year: 1975, iconic: "The rocky terrain of Ramgarh and Gabbar Singh." },
    { title: "Gadar: Ek Prem Katha", year: 2001, iconic: "The iconic hand-pump scene." },
    { title: "Jab We Met", year: 2007, iconic: "Geet’s non-stop talking and the Ratlam station." },
    { title: "Munna Bhai M.B.B.S.", year: 2003, iconic: "The 'Jadu Ki Jhappi' and hospital setting." },
    { title: "Karan Arjun", year: 1995, iconic: "Mere Karan Arjun aayenge." },
    { title: "Devdas", year: 2002, iconic: "Grand sets and the iconic 'Dola Re Dola'." },
    { title: "Bajirao Mastani", year: 2015, iconic: "Deepwarrior aesthetics and massive battlefields." },
    { title: "Padmaavat", year: 2018, iconic: "The 'Jauhar' sequence and Khilji’s dark look." },
    { title: "Stree", year: 2018, iconic: "O Stree Kal Aana written on walls." },
    { title: "Baazigar", year: 1993, iconic: "SRK’s contact lenses and the rooftop scene." },
    { title: "Drishyam", year: 2015, iconic: "The 2nd and 3rd of October dates." },
    { title: "Kaho Naa... Pyaar Hai", year: 2000, iconic: "The blue island and the iconic dance step." },
    { title: "Koi... Mil Gaya", year: 2003, iconic: "Jaadoo and the spaceship sequence." },
    { title: "Dhoom 2", year: 2006, iconic: "Hrithik’s various disguises and heist scenes." },
    { title: "Singham", year: 2011, iconic: "The flying car and the 'Aata Majhi Satakli' pose." },
    { title: "Main Hoon Na", year: 2004, iconic: "The flying classroom and the 'cool' college vibe." },
    { title: "Kuch Kuch Hota Hai", year: 1998, iconic: "The basketball match and the red dupatta." },
    { title: "Om Shanti Om", year: 2007, iconic: "The film set 'dreamy' sequences and the fire scene." },
    { title: "Agneepath", year: 2012, iconic: "The red-themed 'Dussehra' festival sequence." }
]

// Search TMDB specifically
async function searchTMDB(title, year) {
    const apiKey = '7906e89db91de6a62e8a7d0a9fa4b5fc' // User provided key
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}&language=en-US&page=1`

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json'
        }
    }

    // Robust Retry Loop
    for (let i = 0; i < 3; i++) {
        try {
            const res = await fetch(url, options)
            const data = await res.json()
            if (!res.ok) {
                console.error(`TMDB API Error: ${res.status} ${res.statusText}`, JSON.stringify(data))
                return null
            }
            return data.results?.[0] || null
        } catch (err) {
            console.error(`TMDB Attempt ${i + 1} failed for ${title}:`, err.message)
            await new Promise(r => setTimeout(r, 2000)) // Wait 2s
        }
    }
    return null
}

// BYPASSED AI: Use static user context
async function generateHints(title, year, iconic) {
    // console.log('   (Skipping AI due to rate limits - using static user context)')
    return {
        dialogue: "Dialogue coming soon...",
        emoji: "🎬",
        trivia: iconic, // DIRECTLY use user input
        location: "Bollywood"
    }
}

async function main() {
    console.log(`Processing ${moviesToAdd.length} user-requested movies...`)

    for (const m of moviesToAdd) {
        try {
            // Check if exists
            const existing = await prisma.movie.findFirst({
                where: { title: { equals: m.title, mode: 'insensitive' } }
            })

            if (existing) {
                console.log(`✅ Already exists: ${existing.title} (${existing.industry})`)
                // Upsert hint to ensure iconic element is used
                const hints = await generateHints(m.title, m.year, m.iconic)
                await prisma.hint.upsert({
                    where: { movieId: existing.id },
                    update: {
                        level4Trivia: m.iconic, // Force update trivia
                        aiMetadata: {
                            user_iconic: m.iconic,
                            updated_via_request: true
                        }
                    },
                    create: {
                        movieId: existing.id,
                        level2Dialogue: hints.dialogue,
                        level3Emoji: hints.emoji,
                        level4Trivia: m.iconic,
                        aiMetadata: {
                            user_iconic: m.iconic,
                            updated_via_request: true
                        }
                    }
                })
                console.log(`   Refreshed hints for ${existing.title}`)
                continue
            }

            console.log(`Fetching from TMDB: ${m.title}...`)
            const tmdbData = await searchTMDB(m.title, m.year)

            if (!tmdbData) {
                console.log(`❌ TMDB not found after retries: ${m.title}`)
                continue
            }

            // console.log(`Generating hints for: ${m.title}...`)
            const hints = await generateHints(m.title, m.year, m.iconic)

            // Create Movie & Hint
            const created = await prisma.movie.create({
                data: {
                    tmdbId: tmdbData.id,
                    title: tmdbData.title, // Use official TMDB title
                    releaseYear: new Date(tmdbData.release_date).getFullYear(),
                    posterPath: tmdbData.poster_path,
                    backdropPath: tmdbData.backdrop_path,
                    // overview: tmdbData.overview, // Removed as it doesn't exist in schema
                    industry: 'BOLLYWOOD', // Force Bollywood as requested
                    popularity: tmdbData.popularity || 0,
                    voteCount: tmdbData.vote_count || 0,
                    // voteAverage: tmdbData.vote_average || 0, // Removed to match schema
                    hints: {
                        create: {
                            level2Dialogue: hints.dialogue,
                            level3Emoji: hints.emoji,
                            level4Trivia: m.iconic, // Use user iconic
                            aiMetadata: {
                                location: hints.location,
                                user_iconic: m.iconic
                            }
                        }
                    }
                }
            })

            console.log(`🎉 Added: ${created.title}`)

            // Rate limit safety
            await new Promise(r => setTimeout(r, 500))

        } catch (err) {
            console.error(`Failed ${m.title}:`, err)
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })

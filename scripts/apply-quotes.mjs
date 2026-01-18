#!/usr/bin/env node
/**
 * Apply Famous Quotes Script
 * Uses the hardcoded quotes database to fix movies with placeholder dialogues
 * 
 * Usage:
 *   node scripts/apply-quotes.mjs
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

// Create Prisma client with pg adapter
const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Famous movie quotes database (hardcoded)
const famousQuotes = {
    // Hollywood Classics
    "The Godfather": "I'm gonna make him an offer he can't refuse.",
    "The Godfather Part II": "Keep your friends close, but your enemies closer.",
    "Titanic": "I'm the king of the world!",
    "Forrest Gump": "Life is like a box of chocolates. You never know what you're gonna get.",
    "The Dark Knight": "Why so serious?",
    "Fight Club": "The first rule is: you do not talk about it.",
    "Inception": "You mustn't be afraid to dream a little bigger, darling.",
    "The Matrix": "There is no spoon.",
    "Pulp Fiction": "Say 'what' again. I dare you. I double dare you.",
    "The Shawshank Redemption": "Get busy living, or get busy dying.",
    "Gladiator": "Are you not entertained?",
    "Terminator 2: Judgment Day": "Hasta la vista, baby.",
    "The Terminator": "I'll be back.",
    "Star Wars": "May the Force be with you.",
    "The Empire Strikes Back": "No, I am your father.",
    "Jaws": "You're gonna need a bigger boat.",
    "E.T. the Extra-Terrestrial": "Phone home.",
    "Casablanca": "Here's looking at you, kid.",
    "The Wizard of Oz": "There's no place like home.",
    "The Lion King": "Remember who you are.",
    "Toy Story": "To infinity and beyond!",
    "Finding Nemo": "Just keep swimming.",
    "Avatar": "I see you.",
    "Avengers: Endgame": "I love you 3000.",
    "Iron Man": "I am Iron Man.",
    "Spider-Man": "With great power comes great responsibility.",
    "Interstellar": "Love is the one thing that transcends time and space.",
    "The Prestige": "Are you watching closely?",
    "The Social Network": "A million dollars isn't cool. You know what's cool? A billion dollars.",
    "Joker": "I used to think my life was a tragedy, but now I realize it's a comedy.",
    "Shutter Island": "Which would be worse – to live as a monster, or to die as a good man?",
    "Django Unchained": "The 'D' is silent.",

    // Bollywood
    "3 Idiots": "All is well.",
    "Sholay": "Kitne aadmi the?",
    "Dilwale Dulhania Le Jayenge": "Bade bade desh mein aise choti choti baatein hoti rehti hain.",
    "Dangal": "Mhaari choriyan choro se kam hai ke?",
    "Lagaan: Once Upon a Time in India": "Is baar hum jeetenge!",
    "Lagaan": "Is baar hum jeetenge!",
    "PK": "Wrong number.",
    "Zindagi Na Milegi Dobara": "Seize the day, seize the moment.",
    "Kabhi Khushi Kabhie Gham": "Kuch kuch hota hai, tum nahi samjhoge.",
    "My Name Is Khan": "My name is Khan, and I am not a terrorist.",
    "Like Stars on Earth": "Every child is special.",
    "Dil Chahta Hai": "Dosti mein no sorry, no thank you.",
    "Bajrangi Bhaijaan": "Jai Hanuman.",
    "Queen": "Paris chalo!",
    "Barfi!": "Silence speaks louder than words.",

    // Anime
    "Spirited Away": "Once you've met someone you never really forget them.",
    "Your Name.": "I wanted to tell you... that wherever you are in this world, I'll search for you.",
    "My Neighbor Totoro": "A catbus! A catbus!",
    "Howl's Moving Castle": "A heart's a heavy burden.",
    "Princess Mononoke": "Life is suffering. It is hard. The world is cursed. But still you find reasons to keep living.",
    "Demon Slayer -Kimetsu no Yaiba- The Movie: Mugen Train": "Set your heart ablaze!",
    "Jujutsu Kaisen 0": "I'll always love you.",
    "One Piece Film: Red": "I want to create a new world with my songs.",
    "Dragon Ball Super: Broly": "Saiyans are a warrior race!",
    "Weathering with You": "I wished for clear weather, so that I could meet you again.",
    "A Silent Voice": "I'm sorry... for not hearing your voice.",

    // More Hollywood
    "The Avengers": "I have an army. We have a Hulk.",
    "Black Panther": "Wakanda Forever!",
    "Thor: Ragnarok": "Revengers... assemble!",
    "Guardians of the Galaxy": "We are Groot.",
    "Captain America: The First Avenger": "I can do this all day.",
    "Wonder Woman": "I believe in love.",
    "The Batman": "I'm vengeance.",
    "Oppenheimer": "Now I am become Death, the destroyer of worlds.",
    "Dune": "Fear is the mind-killer.",
    "John Wick": "Yeah, I'm thinking I'm back.",
    "Top Gun: Maverick": "It's not the plane, it's the pilot.",
    "Mission: Impossible": "Your mission, should you choose to accept it...",
    "Jurassic Park": "Life finds a way.",
    "Back to the Future": "Roads? Where we're going, we don't need roads.",
    "The Sixth Sense": "I see dead people.",
    "Braveheart": "They may take our lives, but they'll never take our freedom!",
    "Scarface": "Say hello to my little friend!",
    "The Princess Bride": "As you wish.",
    "Apollo 13": "Houston, we have a problem.",
}

// Check if hint needs updating
function needsUpdate(hint) {
    if (!hint) return true

    const placeholderPatterns = [
        /^A memorable (line|quote) from this/i,
        /^A famous quote from this/i,
        /\d{4} film$/,
    ]

    const dialogue = hint.level2Dialogue || ''
    return placeholderPatterns.some(pattern => pattern.test(dialogue))
}

// Find quote for movie (case-insensitive, partial match)
function findQuote(title) {
    // Try exact match first
    if (famousQuotes[title]) return famousQuotes[title]

    // Try case-insensitive match
    const titleLower = title.toLowerCase()
    for (const [movie, quote] of Object.entries(famousQuotes)) {
        if (movie.toLowerCase() === titleLower) return quote
    }

    // Try partial match
    for (const [movie, quote] of Object.entries(famousQuotes)) {
        if (titleLower.includes(movie.toLowerCase()) || movie.toLowerCase().includes(titleLower)) {
            return quote
        }
    }

    return null
}

async function applyQuotes() {
    console.log('\n🎬 CineGuess Quote Fixer')
    console.log('═'.repeat(40))

    const movies = await prisma.movie.findMany({
        include: { hints: true },
        orderBy: { title: 'asc' }
    })

    console.log(`📊 Found ${movies.length} movies in database\n`)

    let updated = 0
    let skipped = 0
    let noQuote = 0

    for (const movie of movies) {
        if (!needsUpdate(movie.hints)) {
            console.log(`  ⏭️  ${movie.title} - already has valid dialogue`)
            skipped++
            continue
        }

        const quote = findQuote(movie.title)

        if (!quote) {
            console.log(`  ⚠️  ${movie.title} - no quote found in database`)
            noQuote++
            continue
        }

        // Update the hint
        if (movie.hints) {
            await prisma.hint.update({
                where: { id: movie.hints.id },
                data: { level2Dialogue: quote }
            })
        } else {
            await prisma.hint.create({
                data: {
                    movieId: movie.id,
                    level1Blur: 45,
                    level2Dialogue: quote,
                    level3Emoji: '🎬🎭🎥',
                    level4Trivia: `This movie was released in ${movie.releaseYear}`,
                }
            })
        }

        console.log(`  ✅ ${movie.title} → "${quote.substring(0, 40)}..."`)
        updated++
    }

    console.log('\n' + '═'.repeat(40))
    console.log('📊 Results:')
    console.log(`  ✅ Updated: ${updated}`)
    console.log(`  ⏭️  Skipped: ${skipped}`)
    console.log(`  ⚠️  No quote: ${noQuote}`)
    console.log('═'.repeat(40))

    await prisma.$disconnect()
    await pool.end()
}

applyQuotes().catch(async (e) => {
    console.error('❌ Failed:', e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
})

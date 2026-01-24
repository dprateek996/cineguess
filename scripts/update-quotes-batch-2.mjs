#!/usr/bin/env node
/**
 * Update Movie Quotes Batch 2 Script
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const QUOTES = [
    // HOLLYWOOD
    { title: "Con Air", quote: "Put the bunny back in the box." },
    { title: "Crouching Tiger, Hidden Dragon", quote: "Only by letting go can we truly possess what is real." },
    { title: "Dark City", quote: "Shut it down! Shut it down forever!" },
    { title: "Don't Breathe", quote: "Now you're going to see what I see." },
    { title: "Event Horizon", quote: "Where we're going, we won't need eyes to see." },
    { title: "Full Metal Jacket", quote: "I am in a world of s***!" },
    { title: "Hereditary", quote: "I am your mother!" },
    { title: "In Bruges", quote: "You're an inanimate f***ing object!" },
    { title: "Independence Day", quote: "Welcome to Earth!" },
    { title: "Life Is Beautiful", quote: "Buongiorno, principessa!" },
    { title: "Manchester by the Sea", quote: "I can't beat it. I can't beat it." },
    { title: "Midsommar", quote: "Do you feel held by him? Does he feel like home to you?" },
    { title: "Misery", quote: "I'm your number one fan." },
    { title: "Moneyball", quote: "How can you not be romantic about baseball?" },
    { title: "Moonlight", quote: "At some point, you gotta decide for yourself who you're going to be." },
    { title: "Mystic River", quote: "Is that my daughter in there?!" },
    { title: "One Flew Over the Cuckoo's Nest", quote: "But I tried, didn't I? Goddammit, at least I tried." },
    { title: "Prisoners", quote: "Every day she's waiting for me, and every day I'm not there." },
    { title: "Rosemary's Baby", quote: "What have you done to its eyes?!" },
    { title: "Schindler's List", quote: "Whoever saves one life, saves the world entire." },
    { title: "Shutter Island", quote: "Which would be worse: To live as a monster, or to die as a good man?" },
    { title: "Sicario", quote: "You should move to a small town, somewhere the rule of law still exists. You will not survive here. You are not a wolf." },
    { title: "Speed", quote: "Pop quiz, hotshot. There's a bomb on a bus." },
    { title: "Split", quote: "The Beast is a sentient creature who represents the highest form of evolution." },
    { title: "Spotlight", quote: "They knew and they let it happen! To kids!" },
    { title: "Star Wars", quote: "May the Force be with you." },
    { title: "Taken", quote: "I will find you, and I will kill you." },
    { title: "Tenet", quote: "Don't try to understand it. Feel it." },
    { title: "Terminator 2: Judgment Day", quote: "Hasta la vista, baby." },
    { title: "The Big Short", quote: "I'm standing in front of a burning house and I'm offering you fire insurance." },
    { title: "The Bourne Identity", quote: "I can tell you the license plate numbers of all six cars outside." },
    { title: "The Fifth Element", quote: "Leeloo Dallas, multipass." },
    { title: "The Game", quote: "There are no rules in this game." },
    { title: "The Imitation Game", quote: "Sometimes it is the people who no one imagines anything of who do the things that no one can imagine." },
    { title: "The Last Samurai", quote: "I will tell you how he lived." },
    { title: "The Machinist", quote: "If you were any thinner, you wouldn't exist." },
    { title: "The Rock", quote: "Your best! Losers always whine about their best. Winners go home and f*** the prom queen." },
    { title: "The Social Network", quote: "A million dollars isn't cool. You know what's cool? A billion dollars." },
    { title: "There Will Be Blood", quote: "I drink your milkshake!" },
    { title: "Top Gun", quote: "I feel the need... the need for speed!" },
    { title: "Zodiac", quote: "I need to look him in the eye and know that it's him." },

    // BOLLYWOOD & REGIONAL
    { title: "Andhadhun", quote: "What is life? It depends on the liver." },
    { title: "Animal", quote: "Papa, meri jaan." },
    { title: "Article 15", quote: "Ham kabhi harijan ho jaate hain, kabhi bahujan ho jaate hain... bas jan nahi ho paate." },
    { title: "Bajrangi Bhaijaan", quote: "Hamare dil mein khuda basta hai... aur unke dil mein ram." },
    { title: "Dhoom 3", quote: "Bande hain hum uske, hum pe kiska zor." },
    { title: "Don 2", quote: "Don ko pakadna mushkil hi nahi, namumkin hai." },
    { title: "Ek Villain", quote: "Aaye hain toh milkar jayenge... maar kar jayenge." },
    { title: "Gangs of Wasseypur", quote: "Baap ka, dada ka, bhai ka; sabka badla lega re tera Faizal." },
    { title: "Hera Pheri", quote: "Yeh Baburao ka style hai!" },
    { title: "Highway", quote: "Jahan se tum mujhe laye ho, main wahan wapas nahi jana chahti... par ye rasta bohot achcha hai." },
    { title: "Jab Tak Hai Jaan", quote: "Teri aankhon ki namkeen mastiyan..." },
    { title: "Karthik Calling Karthik", quote: "Main Karthik bol raha hoon." },
    { title: "LOC: Kargil", quote: "A soldier is not defined by how he died, but how he lived." },
    { title: "M.S. Dhoni: The Untold Story", quote: "Mahi maar raha hai!" },
    { title: "Main Hoon Na", quote: "Kismat badi kutti cheez hai... kabhi bhi palat jati hai." },
    { title: "Maine Pyar Kiya", quote: "Dosti ka ek usool hai madam—no sorry, no thank you." },
    { title: "Paan Singh Tomar", quote: "Beehad mein toh baaghi hote hain, dacait milte hain parliament mein." },
    { title: "Ra.One", quote: "Tum log Ravan ko har saal isliye jalate ho kyunki tum jaante ho ki woh kabhi nahi marta." },
    { title: "Rowdy Rathore", quote: "Jo main bolta hoon, woh main karta hoon... aur jo main nahi bolta, woh main definitely karta hoon." },
    { title: "Shershaah", quote: "Yeh dil maange more!" },
    { title: "Sooryavanshi", quote: "Aunty police bula legi!" },
    { title: "Special 26", quote: "Asli power dil mein nahi, dimaag mein hoti hai." },
    { title: "Tanu Weds Manu", quote: "Aadmi achcha hai... bas thoda sa mental hai." },
    { title: "The Lunchbox", quote: "I think sometimes we forget things if we have no one to tell them to." },
    { title: "Uri: The Surgical Strike", quote: "How's the Josh? High, Sir!" },
    { title: "Veer-Zaara", quote: "Sarhad paar ek aisa shakhs hai, jo aapke liye apni jaan de dega." },
    { title: "Wake Up Sid", quote: "Main udna chahta hoon, daudna chahta hoon... par rukna nahi chahta." },
    { title: "Zindagi Na Milegi Dobara", quote: "Insaan ko dibbe mein sirf tab hona chahiye jab woh mar chuka ho." }
]

async function updateQuotes() {
    console.log('\n🎬 Updating Movie Quotes (Batch 2)')
    console.log('═'.repeat(40))

    let updated = 0
    let notFound = 0
    let failed = 0

    for (const item of QUOTES) {
        try {
            // Attempt 1: Exact Match
            let movie = await prisma.movie.findFirst({
                where: { title: item.title },
                include: { hints: true }
            })

            // Attempt 2: Starts With Match (for cases like "Gangs of Wasseypur - Part 1" matching "Gangs of Wasseypur")
            if (!movie) {
                movie = await prisma.movie.findFirst({
                    where: {
                        title: {
                            startsWith: item.title,
                            mode: 'insensitive'
                        }
                    },
                    include: { hints: true }
                })
            }

            if (!movie) {
                console.log(`❌ Movie not found: "${item.title}"`)
                notFound++
                continue
            }

            if (movie.hints) {
                await prisma.hint.update({
                    where: { id: movie.hints.id },
                    data: {
                        level2Dialogue: item.quote,
                        aiMetadata: {
                            ...(typeof movie.hints.aiMetadata === 'object' ? movie.hints.aiMetadata : {}),
                            manualOverride: true,
                            updatedAt: new Date().toISOString()
                        }
                    }
                })
                console.log(`✅ Updated: "${movie.title}"`)
                updated++
            } else {
                console.log(`⚠️ No hints found for: "${movie.title}" (Skipping)`)
                failed++
            }

        } catch (error) {
            console.error(`❌ Error updating "${item.title}":`, error.message)
            failed++
        }
    }

    console.log('═'.repeat(40))
    console.log(`📊 Results:`)
    console.log(`  ✅ Updated: ${updated}`)
    console.log(`  ❌ Not Found: ${notFound}`)
    console.log(`  ⚠️ Failed/Skipped: ${failed}`)
    console.log('═'.repeat(40))

    await prisma.$disconnect()
    await pool.end()
}

updateQuotes().catch(console.error)

#!/usr/bin/env node
/**
 * Update Movie Quotes Script
 * Updates specific movies with manually provided quotes
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

const QUOTES = [
    // BOLLYWOOD
    { title: "Chalti Ka Naam Gaadi", quote: "Paanch rupaiya baara aana!" },
    { title: "Chupke Chupke", quote: "Main kavi toh nahi hoon, par kavitayein likhta hoon." },
    { title: "Company", quote: "Chanda... sab kuch dhanda hai." },
    { title: "Devdas", quote: "Kaun kambakht bardaasht karne ko peeta hai? Main toh peeta hoon ke bas saans le sakoon." },
    { title: "Dhoom 2", quote: "Mera naam hai Aryan... main chori toh karta hoon, par dil nahi todta." },
    { title: "Drishyam", quote: "Kal hum Goa gaye the, satsang mein." },
    { title: "Ek Tha Tiger", quote: "Shikaar toh sab karte hain, lekin Tiger se behtar shikaar koi nahi karta." },
    { title: "Ek Villain", quote: "Har love story mein ek hero hota hai, ek heroine hoti hai aur ek villain." },
    { title: "English Vinglish", quote: "Mind is like a parachute, it works only when it's open." },
    { title: "Gadar: Ek Prem Katha", quote: "Hindustan Zindabad tha, Zindabad hai, aur Zindabad rahega!" },
    { title: "Gupt: The Hidden Truth", quote: "Duniya haseenon ka mela, mele mein ye dil akela." },
    { title: "Jab We Met", quote: "Main apni favorite hoon!" },
    { title: "Kaho Naa... Pyaar Hai", quote: "Dosti ka matlab hota hai dosti... usme koi logic nahi hota." },
    { title: "Karan Arjun", quote: "Mere Karan Arjun aayenge." },
    { title: "Koi... Mil Gaya", quote: "Jaadoo... Jaadoo!" },
    { title: "Kuch Kuch Hota Hai", quote: "Rahul... naam toh suna hoga." },
    { title: "Munna Bhai M.B.B.S.", quote: "Apun ko 'Jadu ki Jhappi' chahiye." },
    { title: "Om Shanti Om", quote: "Ek chutki sindoor ki keemat tum kya jaano Ramesh babu." },
    { title: "Padmaavat", quote: "Chinta ko talwar ki nok pe rakhe, woh Rajput." },
    { title: "Sholay", quote: "Kitne aadmi the?" },
    { title: "Singham", quote: "Aata majhi satakli!" },

    // HOLLYWOOD
    { title: "Close Encounters of the Third Kind", quote: "We are not alone." },
    { title: "E.T. the Extra-Terrestrial", quote: "E.T. phone home." },
    { title: "Enter the Dragon", quote: "Don't think, feel! It is like a finger pointing away to the moon." },
    { title: "Get Out", quote: "I would have voted for Obama for a third term if I could." },
    { title: "Independence Day", quote: "Welcome to Earth!" },
    { title: "Lethal Weapon", quote: "I'm too old for this s***." },
    { title: "Life Is Beautiful", quote: "Buongiorno, principessa!" },
    { title: "Mission: Impossible - Fallout", quote: "The end you always feared is coming. And the blood will be on your hands." },
    { title: "One Flew Over the Cuckoo's Nest", quote: "But I tried, didn't I? Goddammit, at least I tried." },
    { title: "Requiem for a Dream", quote: "I'm gonna be on television!" },
    { title: "Return of the Jedi", quote: "I am a Jedi, like my father before me." },
    { title: "Schindler's List", quote: "Whoever saves one life, saves the world entire." },
    { title: "Shutter Island", quote: "Which would be worse: To live as a monster, or to die as a good man?" },
    { title: "Silence of the Lambs", quote: "I ate his liver with some fava beans and a nice Chianti." },
    { title: "Star Wars", quote: "May the Force be with you." },
    { title: "Taken", quote: "I will find you, and I will kill you." },
    { title: "Terminator 2: Judgment Day", quote: "Hasta la vista, baby." },
    { title: "The Departed", quote: "I'm the guy who does his job. You must be the other guy." },
    { title: "The Empire Strikes Back", quote: "No, I am your father." },
    { title: "The Exorcist", quote: "What a lovely day for an exorcism." },
    { title: "The Green Mile", quote: "I'm tired, boss." },
    { title: "The Revenant", quote: "As long as you can still grab a breath, you fight." },
    { title: "The Sixth Sense", quote: "I see dead people." },
    { title: "The Social Network", quote: "A million dollars isn't cool. You know what's cool? A billion dollars." },
    { title: "There Will Be Blood", quote: "I drink your milkshake!" },
    { title: "Top Gun", quote: "I feel the need... the need for speed!" },
]

async function updateQuotes() {
    console.log('\n🎬 Updating Movie Quotes')
    console.log('═'.repeat(40))

    let updated = 0
    let notFound = 0
    let failed = 0

    for (const item of QUOTES) {
        try {
            const movie = await prisma.movie.findFirst({
                where: { title: item.title },
                include: { hints: true }
            })

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
                console.log(`✅ Updated: "${item.title}"`)
                updated++
            } else {
                console.log(`⚠️ No hints found for: "${item.title}" (Skipping)`)
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

updateQuotes().catch(async (e) => {
    console.error('❌ Script failed:', e)
    await prisma.$disconnect()
    await pool.end()
    process.exit(1)
})


import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const manualQuotes = [
    { title: "Ae Dil Hai Mushkil", quote: "Ek tarfa pyaar ki taqat hi kuch aur hoti hai." },
    { title: "Andhadhun", quote: "What is life? It depends on the liver." },
    { title: "Animal", quote: "Papa, meri jaan." },
    { title: "Baahubali: The Beginning", quote: "Mera vachan hi hai shasan!" },
    { title: "Bāhubali: The Beginning", quote: "Mera vachan hi hai shasan!" },
    { title: "Chak De! India", quote: "Sattar minute, sattar minute hai tumhare paas." },
    { title: "Chennai Express", quote: "Don't underestimate the power of a common man!" },
    { title: "Chhichhore", quote: "Success ke baad ka plan sabke paas hai, lekin agar galti se fail ho gaye toh failure se kaise deal karna hai... koi nahi bolta." },
    { title: "Dabangg", quote: "Hum yahan ke Robin Hood hain." },
    { title: "Dear Zindagi", quote: "Don't let the past levy a surcharge on your future." },
    { title: "Don", year: 2006, quote: "Don ko pakadna mushkil hi nahi, namumkin hai." },
    { title: "Drishyam", quote: "Kal hum Goa gaye the, satsang mein." },
    { title: "Gangs of Wasseypur", quote: "Baap ka, dada ka, bhai ka; sabka badla lega re tera Faizal." },
    { title: "Ghajini", quote: "Main usey maarne ja raha hoon jiska chehra mujhe yaad nahi." },
    { title: "Gully Boy", quote: "Apna time aayega." },
    { title: "Hera Pheri", quote: "Yeh Baburao ka style hai!" },
    { title: "Hum Aapke Hain Koun..!", quote: "Dhiktana dhiktana!" },
    { title: "Masaan", quote: "Saala yeh dukh kaahe khatam nahi hota bey?" },
    { title: "PK", quote: "Lul ho gayi humri life." },
    { title: "Queen", quote: "Mera haal na Gupta uncle jaisa ho gaya hai." },
    { title: "RRR", quote: "Load, Aim, Shoot!" },
    { title: "Ra.One", quote: "Tum log Ravan ko har saal isliye jalate ho kyunki tum jaante ho ki woh kabhi nahi marta." },
    { title: "Rang De Basanti", quote: "Ab bhi jiska khoon na khaula, khoon nahi woh paani hai." },
    { title: "Rockstar", quote: "Yahan se bohot door, galat aur sahi ke paar, ek maidan hai... main wahan milunga tujhe." },
    { title: "Shershaah", quote: "Yeh dil maange more!" },
    { title: "Special 26", quote: "Asli power dil mein nahi, dimaag mein hoti hai." },
    { title: "Udaan", quote: "Aazaadiyaan, aazaadiyaan!" },
    { title: "Uri: The Surgical Strike", quote: "How's the Josh? High, Sir!" },
    { title: "Yeh Jawaani Hai Deewani", quote: "Main udna chahta hoon, daudna chahta hoon, girna bhi chahta hoon... bus rukna nahi chahta." },
    { title: "Zindagi Na Milegi Dobara", quote: "Insaan ko dibbe mein sirf tab hona chahiye jab woh mar chuka ho." },
    { title: "Death Note", quote: "I'll take a potato chip... and eat it!" },
    { title: "Attack on Titan", quote: "If you win, you live. If you lose, you die. If you don't fight, you can't win." },
    { title: "Cowboy Bebop", quote: "See you space cowboy..." },
    { title: "Demon Slayer", quote: "Set your heart ablaze!" },
    { title: "(500) Days of Summer", quote: "People don’t realize this, but loneliness is underrated." },
    { title: "12 Years a Slave", quote: "I don’t want to survive. I want to live." },
    { title: "1917", quote: "There is only one way this ends. Last man standing." },
    { title: "300", quote: "Tonight, we dine in hell!" },
    { title: "About Time", quote: "We’re all traveling through time together, every day of our lives." },
    { title: "Aliens", quote: "Get away from her, you bitch!" },
    { title: "American Psycho", quote: "I have all the characteristics of a human being: flesh, blood, density, but not a single, clear, identifiable emotion." },
    { title: "American Sniper", quote: "There are three kinds of people in this world: sheep, wolves, and sheepdogs." },
    { title: "Batman Begins", quote: "It's not who I am underneath, but what I do that defines me." },
    { title: "Before Sunrise", quote: "Isn't everything we do in life a way to be loved a little more?" },
    { title: "Birdman", quote: "A thing is a thing, not what is said of that thing." },
    { title: "Black Swan", quote: "I was perfect." },
    { title: "Braveheart", quote: "They may take our lives, but they'll never take our freedom!" },
    { title: "Cinema Paradiso", quote: "Whatever you end up doing, love it." },
    { title: "Coherence", quote: "There's another us out there." },
    { title: "Collateral", quote: "Millions of people in this city and nobody knows each other." },
    { title: "Donnie Darko", quote: "Why are you wearing that stupid man suit?" },
    { title: "Drive", quote: "I don't carry a gun. I drive." },
    { title: "Dunkirk", quote: "Seeing home doesn't help us get there." },
    { title: "Fargo", quote: "And for what? For a little bit of money." },
    { title: "Fight Club", quote: "The first rule of Fight Club is: You do not talk about Fight Club." },
    { title: "Gone Girl", quote: "I've killed for you. Who else can say that?" },
    { title: "Heat", quote: "Don't let yourself get attached to anything you are not willing to walk out on in 30 seconds flat." },
    { title: "Her", quote: "I'm yours and I'm not yours." },
    { title: "Inception", quote: "You mustn't be afraid to dream a little bigger, darling." },
    { title: "Inglourious Basterds", quote: "I think this just might be my masterpiece." },
    { title: "Interstellar", quote: "Love is the one thing that transcends time and space." },
    { title: "John Wick", quote: "People keep asking if I'm back and I haven't really had an answer, but yeah, I'm thinking I'm back." },
    { title: "Jojo Rabbit", quote: "Let everything happen to you. Beauty and terror. Just keep going." },
    { title: "Kill Bill: Vol. 1", quote: "That woman deserves her revenge and we deserve to die." },
    { title: "Mad Max: Fury Road", quote: "Witness me!" },
    { title: "Memento", quote: "I have to believe in a world outside my own mind." },
    { title: "No Country for Old Men", quote: "What's the most you ever lost on a coin toss?" },
    { title: "Oldboy", quote: "Laugh and the world laughs with you. Weep and you weep alone." },
    { title: "Parasite", quote: "You know what kind of plan never fails? No plan at all." },
    { title: "Psycho", quote: "A boy's best friend is his mother." },
    { title: "Pulp Fiction", quote: "Say 'what' again. I dare you, I double dare you!" },
    { title: "Saving Private Ryan", quote: "Earn this. Earn it." },
    { title: "Se7en", quote: "What's in the box?!" },
    { title: "The Dark Knight", quote: "Why so serious?" },
    { title: "The Godfather Part II", quote: "Keep your friends close, but your enemies closer." },
    { title: "The Prestige", quote: "Are you watching closely?" },
    { title: "The Shining", quote: "Here's Johnny!" },
    { title: "Whiplash", quote: "There are no two words in the English language more harmful than 'good job'." }
]

const overrides = {
    "Dabangg": "Dabangg 3",
    "Drishyam": "Drishyam 2",
    "Gangs of Wasseypur": "Gangs of Wasseypur - Part 2",
    "Gully Boy": "Gully Boy: Live In Concert",
    "Baahubali: The Beginning": "Bāhubali: The Beginning"
}

async function main() {
    console.log(`Applying ${manualQuotes.length} manual quotes...`)

    for (const item of manualQuotes) {
        try {
            // Check overrides
            const searchTitle = overrides[item.title] || item.title

            // Find movie
            let movie = null;

            // Try specific year match first if provided (only if no override)
            if (item.year && !overrides[item.title]) {
                movie = await prisma.movie.findFirst({
                    where: {
                        title: { equals: searchTitle, mode: 'insensitive' },
                        releaseYear: item.year
                    }
                })
            }

            // Fallback to title only
            if (!movie) {
                movie = await prisma.movie.findFirst({
                    where: {
                        title: { equals: searchTitle, mode: 'insensitive' }
                    }
                })
            }

            if (!movie) {
                // If we tried an override and failed, log distinct message
                if (overrides[item.title]) {
                    console.log(`❌ Override failed: ${item.title} -> ${searchTitle}`)
                } else {
                    console.log(`❌ Movie not found: ${item.title}`)
                }
                continue
            }

            // Find hint
            const hint = await prisma.hint.findUnique({
                where: { movieId: movie.id }
            })

            if (hint) {
                await prisma.hint.update({
                    where: { id: hint.id },
                    data: {
                        level2Dialogue: item.quote,
                        aiMetadata: {
                            ...hint.aiMetadata,
                            source: 'manual_override',
                            updatedAt: new Date().toISOString()
                        }
                    }
                })
                console.log(`✅ Updated: ${movie.title} (${movie.releaseYear})`)
            } else {
                console.log(`⚠️ Hint record missing for: ${movie.title}`)
            }

        } catch (err) {
            console.error(`Error updating ${item.title}:`, err)
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })

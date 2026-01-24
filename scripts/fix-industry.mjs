
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// List of known suspects or patterns
// Ideally we'd use an API to check origin country, but for now let's look for known Hollywood titles 
// present in industry='BOLLYWOOD'

const knownHollywoodTitles = [
    "Death Race 2", "Death Race", "Mad Max", "Terminator", "Alien", "Aliens",
    "Predator", "Rambo", "Rocky", "Die Hard", "Mission Impossible",
    "Fast and Furious", "Iron Man", "Avengers", "Batman", "Superman",
    "Spider-Man", "X-Men", "Harry Potter", "Lord of the Rings", "Star Wars",
    "Matrix", "John Wick", "Gladiator", "Titanic", "Avatar", "Inception",
    "Interstellar", "Joker", "Deadpool", "Black Panther", "Thor", "Captain America",
    "Wonder Woman", "Aquaman", "Justice League", "The Dark Knight", "Pulp Fiction",
    "Fight Club", "Forrest Gump", "The Godfather", "Schindler's List", "Goodfellas",
    "The Shawshank Redemption", "12 Angry Men", "Casablanca", "Citizen Kane",
    "Gone with the Wind", "The Wizard of Oz", "Psycho", "Vertigo", "2001: A Space Odyssey",
    "A Clockwork Orange", "Taxi Driver", "Apocalypse Now", "The Shining", "Blade Runner",
    "E.T.", "Back to the Future", "Raiders of the Lost Ark", "Jurassic Park",
    "Jaws", "Star Trek", "007", "James Bond", "Bourne", "Taken", "Transporter",
    "Expendables", "Top Gun", "Rocky", "Creed", "Saw", "Final Destination",
    "Scream", "Halloween", "Friday the 13th", "Nightmare on Elm Street", "Chucky",
    "It", "Get Out", "Us", "A Quiet Place", "Bird Box", "Paranormal Activity",
    "Insidious", "Conjuring", "Annabelle", "Nun", "Exorcist", "Omen",
    "Poltergeist", "Gremlins", "Ghostbusters", "Beetlejuice", "Addams Family",
    "Men in Black", "Independence Day", "Armageddon", "Deep Impact", "Twister"
]

async function main() {
    console.log('Scanning for misclassified Hollywood movies in Bollywood...')

    const misclassified = await prisma.movie.findMany({
        where: {
            industry: 'BOLLYWOOD',
            OR: [
                { title: { in: knownHollywoodTitles } },
                // Also fuzzy match potentially
                { title: { contains: 'Death Race', mode: 'insensitive' } }
            ]
        }
    })

    console.log(`Found ${misclassified.length} misclassified movies:`)
    misclassified.forEach(m => console.log(`- ${m.title} (${m.releaseYear})`))

    if (misclassified.length > 0) {
        console.log('\nFixing...')
        const result = await prisma.movie.updateMany({
            where: {
                id: { in: misclassified.map(m => m.id) }
            },
            data: {
                industry: 'HOLLYWOOD'
            }
        })
        console.log(`Updated ${result.count} movies to HOLLYWOOD.`)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
    })

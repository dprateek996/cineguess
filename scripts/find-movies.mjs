#!/usr/bin/env node
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function findMovies() {
    const searchTerms = ['Lambs']

    for (const term of searchTerms) {
        console.log(`\n🔍 Searching for "${term}"...`)
        const movies = await prisma.movie.findMany({
            where: {
                title: { contains: term, mode: 'insensitive' }
            },
            select: { title: true, releaseYear: true }
        })

        if (movies.length > 0) {
            movies.forEach(m => console.log(`   Found: "${m.title}" (${m.releaseYear})`))
        } else {
            console.log(`   ❌ No matches found.`)
        }
    }

    await prisma.$disconnect()
    await pool.end()
}

findMovies()

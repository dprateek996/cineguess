#!/usr/bin/env node
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import fs from 'fs/promises'
import path from 'path'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function listFallbackMovies() {
    console.log('\n📝 Generating List of Fallback Movies...')

    const movies = await prisma.movie.findMany({
        include: { hints: true },
        orderBy: { title: 'asc' }
    })

    const placeholderPatterns = [
        /A memorable (line|quote|moment) from this/i,
        /Dialogue coming soon/i,
        /^\d{4} film$/,
        /^🎬🎭🎪$/
    ]

    const fallbackMovies = movies.filter(movie => {
        if (!movie.hints) return false
        const dialogue = movie.hints.level2Dialogue || ''
        return placeholderPatterns.some(p => p.test(dialogue))
    })

    const outputContent = fallbackMovies.map(m => `${m.title} (${m.releaseYear})`).join('\n')
    const outputPath = path.resolve(process.cwd(), 'fallback_movies_list.txt')

    await fs.writeFile(outputPath, outputContent)

    console.log(`✅ Found ${fallbackMovies.length} movies.`)
    console.log(`📄 List saved to: ${outputPath}`)

    // Also log to console for immediate visibility if list is short, otherwise just first few
    if (fallbackMovies.length > 0) {
        console.log('\nPreview (first 10):')
        fallbackMovies.slice(0, 10).forEach(m => console.log(`- ${m.title} (${m.releaseYear})`))
        if (fallbackMovies.length > 10) console.log(`... and ${fallbackMovies.length - 10} more.`)
    }

    await prisma.$disconnect()
    await pool.end()
}

listFallbackMovies().catch(console.error)

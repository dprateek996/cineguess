#!/usr/bin/env node
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function checkHealth() {
    console.log('\n🏥 CineGuess Database Health Check')
    console.log('═'.repeat(40))

    const movies = await prisma.movie.findMany({
        include: { hints: true }
    })

    console.log(`📊 Total Movies: ${movies.length}`)

    const issues = {
        missingHints: [],
        fallbackQuotes: [],
        missingImages: [],
        suspiciousImages: []
    }

    const placeholderPatterns = [
        /A memorable (line|quote|moment) from this/i,
        /Dialogue coming soon/i,
        /^\d{4} film$/,
        /^🎬🎭🎪$/
    ]

    for (const movie of movies) {
        // 1. Check Hints
        if (!movie.hints) {
            issues.missingHints.push(movie.title)
        } else {
            const dialogue = movie.hints.level2Dialogue || ''
            const isFallback = placeholderPatterns.some(p => p.test(dialogue))
            if (isFallback) {
                issues.fallbackQuotes.push({ title: movie.title, quote: dialogue })
            }
        }

        // 2. Check Images
        if (!movie.posterPath) issues.missingImages.push(`${movie.title} (Poster)`)
        if (!movie.backdropPath) issues.missingImages.push(`${movie.title} (Backdrop)`)

        // Check for suspicious image paths (e.g. null, "null", short strings)
        if (movie.posterPath && (movie.posterPath === 'null' || movie.posterPath.length < 5)) {
            issues.suspiciousImages.push(`${movie.title} (Poster: ${movie.posterPath})`)
        }
        if (movie.backdropPath && (movie.backdropPath === 'null' || movie.backdropPath.length < 5)) {
            issues.suspiciousImages.push(`${movie.title} (Backdrop: ${movie.backdropPath})`)
        }
    }

    // Report
    console.log(`\n🚩 Issues Found:`)

    if (issues.missingHints.length > 0) {
        console.log(`\n❌ Missing Hints (${issues.missingHints.length}):`)
        issues.missingHints.forEach(t => console.log(`   - ${t}`))
    } else {
        console.log(`\n✅ No missing hints.`)
    }

    if (issues.fallbackQuotes.length > 0) {
        console.log(`\n⚠️  Fallback/Placeholder Quotes (${issues.fallbackQuotes.length}):`)
        issues.fallbackQuotes.forEach(i => console.log(`   - ${i.title}: "${i.quote.substring(0, 50)}..."`))
    } else {
        console.log(`\n✅ No fallback quotes found.`)
    }

    if (issues.missingImages.length > 0) {
        console.log(`\n❌ Missing Images (${issues.missingImages.length}):`)
        issues.missingImages.forEach(t => console.log(`   - ${t}`))
    } else {
        console.log(`\n✅ No missing images (empty paths).`)
    }

    if (issues.suspiciousImages.length > 0) {
        console.log(`\n⚠️  Suspicious Image Paths (${issues.suspiciousImages.length}):`)
        issues.suspiciousImages.forEach(t => console.log(`   - ${t}`))
    } else {
        console.log(`\n✅ No suspicious image paths detected.`)
    }

    console.log('\n' + '═'.repeat(40))
    await prisma.$disconnect()
    await pool.end()
}

checkHealth().catch(console.error)

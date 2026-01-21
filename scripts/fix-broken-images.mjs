#!/usr/bin/env node
/**
 * Clean up movies with broken TMDB image URLs
 * This script verifies each movie's poster URL and removes those with 404 errors
 */

import dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w780'

async function checkImageUrl(path) {
    if (!path) return false
    try {
        const res = await fetch(TMDB_IMAGE_BASE + path, { method: 'HEAD' })
        return res.ok
    } catch {
        return false
    }
}

async function main() {
    console.log('🔍 Validating TMDB image URLs...\n')

    const allMovies = await prisma.movie.findMany({
        select: {
            id: true,
            title: true,
            posterPath: true,
            backdropPath: true,
            industry: true
        }
    })

    console.log(`Checking ${allMovies.length} movies...\n`)

    const brokenMovies = []

    for (const movie of allMovies) {
        const posterOk = await checkImageUrl(movie.posterPath)
        const backdropOk = await checkImageUrl(movie.backdropPath)

        if (!posterOk || !backdropOk) {
            brokenMovies.push({
                ...movie,
                posterOk,
                backdropOk
            })
            console.log(`❌ ${movie.title} (${movie.industry})`)
            console.log(`   poster: ${posterOk ? '✓' : '✗'} | backdrop: ${backdropOk ? '✓' : '✗'}`)
        } else {
            console.log(`✓ ${movie.title}`)
        }
    }

    console.log(`\n${'─'.repeat(50)}`)
    console.log(`Total movies: ${allMovies.length}`)
    console.log(`Broken images: ${brokenMovies.length}`)
    console.log(`Valid movies: ${allMovies.length - brokenMovies.length}`)

    if (brokenMovies.length > 0) {
        const deleteArg = process.argv.includes('--delete')
        if (deleteArg) {
            console.log('\n🗑️ Deleting movies with broken images...')
            for (const movie of brokenMovies) {
                // Delete related records first
                await prisma.hint.deleteMany({ where: { movieId: movie.id } })
                await prisma.gameSession.deleteMany({ where: { movieId: movie.id } })
                await prisma.dailyGame.deleteMany({ where: { movieId: movie.id } })
                await prisma.movie.delete({ where: { id: movie.id } })
                console.log(`  ✓ Deleted: ${movie.title}`)
            }
            console.log('\n✅ Cleanup complete!')

            const remaining = await prisma.movie.count()
            console.log(`📊 Remaining movies: ${remaining}`)
        } else {
            console.log('\n💡 Run with --delete to remove broken movies:')
            console.log('   node scripts/fix-broken-images.mjs --delete')
        }
    } else {
        console.log('\n✅ All movie images are valid!')
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })

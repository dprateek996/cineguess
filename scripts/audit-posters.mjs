#!/usr/bin/env node
/**
 * Audit and fix movies with missing poster/backdrop images
 */

import dotenv from 'dotenv'
dotenv.config()

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🔍 Auditing movie images...\n')

    const allMovies = await prisma.movie.findMany({
        select: {
            id: true,
            title: true,
            posterPath: true,
            backdropPath: true,
            industry: true
        }
    })

    const badMovies = allMovies.filter(m =>
        !m.posterPath || m.posterPath === '' ||
        !m.backdropPath || m.backdropPath === ''
    )

    console.log(`Total movies: ${allMovies.length}`)
    console.log(`Movies with missing images: ${badMovies.length}`)
    console.log(`Good movies: ${allMovies.length - badMovies.length}\n`)

    if (badMovies.length > 0) {
        console.log('⚠️ Movies with missing images:')
        badMovies.forEach(m => {
            console.log(`  - ${m.title} (${m.industry})`)
            console.log(`    poster: ${m.posterPath || 'MISSING'}`)
            console.log(`    backdrop: ${m.backdropPath || 'MISSING'}`)
        })

        // Ask to delete
        const deleteArg = process.argv.includes('--delete')
        if (deleteArg) {
            console.log('\n🗑️ Deleting movies with missing images...')
            for (const movie of badMovies) {
                // Delete hints first
                await prisma.hint.deleteMany({ where: { movieId: movie.id } })
                await prisma.movie.delete({ where: { id: movie.id } })
                console.log(`  ✓ Deleted: ${movie.title}`)
            }
            console.log('\n✅ Cleanup complete!')
        } else {
            console.log('\n💡 Run with --delete to remove these movies')
        }
    } else {
        console.log('✅ All movies have valid image paths!')
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })

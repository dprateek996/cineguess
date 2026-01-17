#!/usr/bin/env node
/**
 * Database Hydration Script
 * Run this to populate your database with movies and AI-generated hints
 * 
 * Usage:
 *   npm run hydrate -- --industry BOLLYWOOD --count 10
 */

import { hydratePopularMovies } from '../src/services/movieService.js'

async function main() {
    const args = process.argv.slice(2)

    const industryArg = args.find(arg => arg.startsWith('--industry'))
    const countArg = args.find(arg => arg.startsWith('--count'))

    const industry = industryArg?.split('=')[1] || 'HOLLYWOOD'
    const count = parseInt(countArg?.split('=')[1] || '20')

    console.log(`🎬 Starting hydration for ${industry}...`)
    console.log(`📊 Target: ${count} movies\n`)

    try {
        const movies = await hydratePopularMovies(industry, count)

        console.log(`\n✅ Successfully hydrated ${movies.length} movies!`)
        console.log('\nSample movies:')
        movies.slice(0, 5).forEach(movie => {
            console.log(`  - ${movie.title} (${movie.releaseYear})`)
        })
    } catch (error) {
        console.error('❌ Hydration failed:', error)
        process.exit(1)
    }
}

main()

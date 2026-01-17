#!/usr/bin/env node
/**
 * Daily Movie Selection Script
 * Run this as a cron job to select daily movies for each industry
 * 
 * Usage:
 *   npm run select-daily
 */

import prisma from '../src/lib/prisma.js'
import { getRandomMovie } from '../src/services/movieService.js'

async function selectDailyMovies() {
    const industries = ['HOLLYWOOD', 'BOLLYWOOD', 'GLOBAL']
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    console.log(`📅 Selecting daily movies for ${today.toDateString()}...\n`)

    for (const industry of industries) {
        try {
            const existing = await prisma.dailyGame.findFirst({
                where: {
                    date: today,
                    industry,
                },
            })

            if (existing) {
                console.log(`⏭️  ${industry}: Already set (${existing.id})`)
                continue
            }

            const movie = await getRandomMovie(industry)

            if (!movie) {
                console.log(`⚠️  ${industry}: No movies available`)
                continue
            }

            const dailyGame = await prisma.dailyGame.create({
                data: {
                    date: today,
                    movieId: movie.id,
                    industry,
                },
            })

            console.log(`✅ ${industry}: "${movie.title}" (${movie.releaseYear})`)
        } catch (error) {
            console.error(`❌ ${industry}: Failed -`, error)
        }
    }

    console.log('\n🎉 Daily selection complete!')
}

selectDailyMovies()
    .catch(console.error)
    .finally(() => process.exit(0))

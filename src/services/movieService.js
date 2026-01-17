import prisma from '@/lib/prisma'
import { getMovieDetails, discoverMovies } from '@/lib/tmdb'
import { geminiModel, generateHintsPrompt } from '@/lib/gemini'



export async function movieExists(tmdbId) {
    const movie = await prisma.movie.findUnique({
        where: { tmdbId },
    })
    return !!movie
}

async function generateHints(movieTitle, releaseYear, industry) {
    try {
        const prompt = generateHintsPrompt(movieTitle, releaseYear, industry)
        const result = await geminiModel.generateContent(prompt)
        const response = result.response.text()

        const cleanedResponse = response
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim()

        const hints = JSON.parse(cleanedResponse)

       
        if (!hints.dialogue || !hints.emoji || !hints.trivia || !hints.location) {
            throw new Error('Invalid hint structure from Gemini')
        }

        return hints
    } catch (error) {
        console.error('Gemini hint generation failed:', error)

    
        return {
            dialogue: `A memorable quote from this ${releaseYear} film`,
            emoji: '🎬🎭🎪',
            trivia: `This movie was released in ${releaseYear}`,
            location: 'A significant filming location',
        }
    }
}

// Hydrate a single movie (fetch from TMDB + generate hints)
export async function hydrateMovie(tmdbId, industry) {
    try {
        // Check if already exists
        const exists = await movieExists(tmdbId)
        if (exists) {
            console.log(`Movie ${tmdbId} already exists in database`)
            return await prisma.movie.findUnique({
                where: { tmdbId },
                include: { hints: true },
            })
        }

        // Fetch from TMDB
        const tmdbMovie = await getMovieDetails(tmdbId)

        const releaseYear = new Date(tmdbMovie.release_date).getFullYear()

        // Generate AI hints
        console.log(`Generating hints for: ${tmdbMovie.title} (${releaseYear})`)
        const hints = await generateHints(tmdbMovie.title, releaseYear, industry)

        // Store in database
        const movie = await prisma.movie.create({
            data: {
                tmdbId: tmdbMovie.id,
                title: tmdbMovie.title,
                releaseYear,
                industry,
                genres: tmdbMovie.genres?.map((g) => g.name) || [],
                posterPath: tmdbMovie.poster_path || '',
                backdropPath: tmdbMovie.backdrop_path || '',
                hints: {
                    create: {
                        level1Blur: 45,
                        level2Dialogue: hints.dialogue,
                        level3Emoji: hints.emoji,
                        level4Trivia: hints.trivia,
                        aiMetadata: {
                            location: hints.location,
                            generatedAt: new Date().toISOString(),
                        },
                    },
                },
            },
            include: {
                hints: true,
            },
        })

        console.log(`Successfully hydrated movie: ${movie.title}`)
        return movie
    } catch (error) {
        console.error('Movie hydration failed:', error)
        throw new Error(`Failed to hydrate movie ${tmdbId}: ${error}`)
    }
}

// Batch hydration: Fetch popular movies and hydrate them
export async function hydratePopularMovies(industry, count = 20) {
    try {
        const movies = await discoverMovies({
            industry,
            minVoteCount: 500,
            page: 1,
        })

        const hydratedMovies = []

        for (let i = 0; i < Math.min(count, movies.length); i++) {
            try {
                const movie = await hydrateMovie(movies[i].id, industry)
                hydratedMovies.push(movie)

                // Rate limiting: wait 2 seconds between API calls
                await new Promise(resolve => setTimeout(resolve, 2000))
            } catch (error) {
                console.error(`Failed to hydrate movie ${movies[i].id}:`, error)
                continue
            }
        }

        return hydratedMovies
    } catch (error) {
        console.error('Batch hydration failed:', error)
        throw error
    }
}

// Get a random movie for gameplay
export async function getRandomMovie(industry) {
    const where = industry ? { industry } : {}

    const count = await prisma.movie.count({ where })

    if (count === 0) {
        throw new Error(`No movies found for industry: ${industry || 'all'}`)
    }

    const skip = Math.floor(Math.random() * count)

    const movie = await prisma.movie.findFirst({
        where,
        skip,
        include: {
            hints: true,
        },
    })

    return movie
}

export default {
    movieExists,
    hydrateMovie,
    hydratePopularMovies,
    getRandomMovie,
}

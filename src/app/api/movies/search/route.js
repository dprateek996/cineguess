import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * Movie Search API - Returns movies matching query for autocomplete
 * 
 * GET /api/movies/search?q=batman&industry=HOLLYWOOD
 */
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q')
        const industry = searchParams.get('industry') || 'HOLLYWOOD'

        if (!query || query.length < 2) {
            return NextResponse.json({ movies: [] })
        }

        // Search movies by title (case-insensitive)
        const movies = await prisma.movie.findMany({
            where: {
                industry: industry,
                title: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            select: {
                id: true,
                title: true,
                releaseYear: true,
                posterPath: true,
            },
            take: 8,  // Limit results
            orderBy: {
                globalSolveRate: 'desc'  // Popular movies first
            }
        })

        return NextResponse.json({ movies })
    } catch (error) {
        console.error('Movie search error:', error)
        return NextResponse.json(
            { error: 'Failed to search movies', movies: [] },
            { status: 500 }
        )
    }
}

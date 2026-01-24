import { NextResponse } from 'next/server'
import { z } from 'zod'
import { initializeGameSession } from '@/services/gameService'

const initGameSchema = z.object({
    industry: z.enum(['HOLLYWOOD', 'BOLLYWOOD', 'GLOBAL', 'ANIME']),
    mode: z.enum(['classic', 'rapidfire']).optional().default('classic'),
})

export async function POST(request) {
    try {
        const body = await request.json()
        const { industry, mode } = initGameSchema.parse(body)
        const userId = undefined // Will be implemented with auth

        if (!process.env.TMDB_API_TOKEN && !process.env.TMDB_API_KEY) {
            console.error("CRITICAL: Missing TMDB_API_KEY or TMDB_API_TOKEN env var");
        }
        if (!process.env.DATABASE_URL) {
            console.error("CRITICAL: Missing DATABASE_URL env var");
        }

        try {
            const gameSession = await initializeGameSession(industry, userId, mode)
            return NextResponse.json({
                success: true,
                data: gameSession,
            })
        } catch (initError) {
            console.error('Game Init Failed (Emergency Mode Activated):', initError);

            // EMERGENCY ROUTE FALLBACK: Even if gameService explodes, give the user a game.
            // Pick a random movie from fallback
            const { FALLBACK_MOVIES } = await import('@/data/fallback-movies');
            const fallbackList = FALLBACK_MOVIES[industry] || FALLBACK_MOVIES.HOLLYWOOD;
            const movie = fallbackList[Math.floor(Math.random() * fallbackList.length)];

            const timestamp = Date.now();
            const mockSession = {
                sessionId: `emergency-${timestamp}`,
                currentRound: 1,
                currentStage: 1,
                streak: 0,
                totalScore: 0,
                lives: mode === 'rapidfire' ? 3 : null,
                stageData: {
                    type: 'poster',
                    data: { posterPath: movie.posterPath, blurAmount: 10 },
                    pointsMultiplier: 4,
                    label: 'Blurred Poster'
                },
                allStages: {
                    1: { type: 'poster', data: { posterPath: movie.posterPath, blurAmount: 10 }, pointsMultiplier: 4, label: 'Blurred Poster' },
                    2: { type: 'dialogue', data: { dialogue: movie.hints.level2Dialogue }, pointsMultiplier: 2, label: 'Famous Dialogue' },
                    3: { type: 'scene', data: { backdropPath: movie.backdropPath }, pointsMultiplier: 1, label: 'Movie Scene' }
                },
                hints: [
                    { type: 'poster', text: 'Look at the blurred poster', level: 1 },
                    { type: 'dialogue', text: movie.hints.level2Dialogue, level: 2 },
                    { type: 'scene', text: 'Scene Reveal', level: 3 },
                ],
                blurAmount: 10,
                timeLimit: mode === 'rapidfire' ? 30 : null,
                posterPath: movie.posterPath,
                backdropPath: movie.backdropPath,
                industry,
                mode,
                isGameOver: false,
            }

            return NextResponse.json({
                success: true,
                data: mockSession,
                note: "Served via Emergency Route Fallback"
            })
        }
    } catch (error) {
        console.error('Game init error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data', details: error.issues },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to initialize game' },
            { status: 500 }
        )
    }
}

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

        const gameSession = await initializeGameSession(industry, userId, mode)

        return NextResponse.json({
            success: true,
            data: gameSession,
        })
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

import { NextResponse } from 'next/server'
import { z } from 'zod'
import { processGuess, endGame } from '@/services/gameService'

const guessSchema = z.object({
    sessionId: z.string().min(1, 'Session ID is required'),
    guess: z.string().min(1, 'Guess cannot be empty').max(200, 'Guess is too long'),
    currentStage: z.number().min(1).max(4).optional().default(1),
    timeRemaining: z.number().nullable().optional(),
})

const endGameSchema = z.object({
    sessionId: z.string().min(1),
    reason: z.enum(['lives', 'timeout']).optional().default('lives'),
})

export async function POST(request) {
    try {
        const body = await request.json()

        // Handle end game request (for rapid fire)
        if (body.action === 'end') {
            const { sessionId, reason } = endGameSchema.parse(body)
            const result = await endGame(sessionId, reason)
            return NextResponse.json({ success: true, data: result })
        }

        // Handle guess submission
        const { sessionId, guess, currentStage, timeRemaining } = guessSchema.parse(body)
        const result = await processGuess(sessionId, guess, currentStage, timeRemaining)

        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error) {
        console.error('Guess processing error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data', details: error.issues },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Failed to process guess' },
            { status: 500 }
        )
    }
}

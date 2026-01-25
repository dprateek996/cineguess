import { NextResponse } from 'next/server'
import { z } from 'zod'
import { processGuess, endGame, skipMovie } from '@/services/gameService'

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

const skipSchema = z.object({
    sessionId: z.string().min(1),
    lives: z.number().min(0).max(3).optional().default(3),
})

import { checkRateLimit } from '@/lib/ratelimit'

export async function POST(request) {
    try {
        // Rate limit check
        const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
        const { success } = await checkRateLimit(ip)

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Too many requests. Please slow down.' },
                { status: 429 }
            )
        }

        const body = await request.json()

        // Handle end game request (for rapid fire)
        if (body.action === 'end') {
            const { sessionId, reason } = endGameSchema.parse(body)
            const result = await endGame(sessionId, reason)
            return NextResponse.json({ success: true, data: result })
        }

        // Handle skip request (for rapid fire timeout/wrong)
        if (body.action === 'skip') {
            const { sessionId, lives } = skipSchema.parse(body)
            const result = await skipMovie(sessionId, lives)
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

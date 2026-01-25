import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const submitScoreSchema = z.object({
    username: z.string().min(2).max(20),
    score: z.number().int().positive(),
    category: z.enum(['BOLLYWOOD', 'HOLLYWOOD', 'RAPIDFIRE_BOLLYWOOD', 'RAPIDFIRE_HOLLYWOOD']),
    moviesGuessed: z.number().int().nonnegative().optional().default(0),
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
        const { username, score, category, moviesGuessed } = submitScoreSchema.parse(body)

        // Upsert: Only update if new score is higher than existing
        const existing = await prisma.leaderboard.findUnique({
            where: {
                username_category: {
                    username,
                    category,
                },
            },
        })

        if (existing) {
            // Only update if new score is higher
            if (score > existing.highScore) {
                const updated = await prisma.leaderboard.update({
                    where: {
                        username_category: {
                            username,
                            category,
                        },
                    },
                    data: {
                        highScore: score,
                        moviesGuessed: Math.max(moviesGuessed, existing.moviesGuessed),
                    },
                })

                return NextResponse.json({
                    success: true,
                    data: updated,
                    isNewHighScore: true,
                })
            } else {
                return NextResponse.json({
                    success: true,
                    data: existing,
                    isNewHighScore: false,
                    message: 'Score not higher than existing high score',
                })
            }
        } else {
            // Create new entry
            try {
                const created = await prisma.leaderboard.create({
                    data: {
                        username,
                        highScore: score,
                        category,
                        moviesGuessed,
                    },
                })

                return NextResponse.json({
                    success: true,
                    data: created,
                    isNewHighScore: true,
                })
            } catch (createError) {
                // Handle P2002 unique constraint error (race condition)
                if (createError.code === 'P2002') {
                    // Entry was created between our check and now.
                    // We need to check if our score is higher than the one that was just created.
                    const freshEntry = await prisma.leaderboard.findUnique({
                        where: {
                            username_category: {
                                username,
                                category,
                            },
                        },
                    })

                    if (freshEntry && score > freshEntry.highScore) {
                        const updated = await prisma.leaderboard.update({
                            where: {
                                username_category: {
                                    username,
                                    category,
                                },
                            },
                            data: {
                                highScore: score,
                                moviesGuessed: Math.max(moviesGuessed, freshEntry.moviesGuessed),
                            },
                        })

                        return NextResponse.json({
                            success: true,
                            data: updated,
                            isNewHighScore: true,
                        })
                    } else {
                        // Score not higher than what was just created
                        return NextResponse.json({
                            success: true,
                            data: freshEntry,
                            isNewHighScore: false,
                            message: 'Score not higher than existing high score (race condition handled)',
                        })
                    }
                }
                throw createError; // Re-throw other errors
            }
        }
    } catch (error) {
        console.error('Submit score error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid request data', details: error.issues },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, error: 'Failed to submit score' },
            { status: 500 }
        )
    }
}

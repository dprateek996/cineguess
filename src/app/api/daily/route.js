import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams
        const industry = searchParams.get('industry')

        const today = new Date()
        today.setUTCHours(0, 0, 0, 0)

        let dailyGame = await prisma.dailyGame.findFirst({
            where: {
                date: today,
                ...(industry && { industry }),
            },
            include: {
                movie: {
                    include: {
                        hints: true,
                    },
                },
            },
        })

        // If no daily game exists and industry is provided, create one seamlessly
        if (!dailyGame && industry) {
            // Auto-create daily game if none exists

            // Count movies in this industry
            const count = await prisma.movie.count({
                where: { industry: industry }
            });

            if (count > 0) {
                // Pick a random movie
                const skip = Math.floor(Math.random() * count);
                const movie = await prisma.movie.findFirst({
                    where: { industry: industry },
                    skip: skip,
                    include: { hints: true }
                });

                if (movie) {
                    try {
                        dailyGame = await prisma.dailyGame.create({
                            data: {
                                date: today,
                                industry: industry,
                                movieId: movie.id,
                            },
                            include: {
                                movie: {
                                    include: {
                                        hints: true
                                    }
                                }
                            }
                        });
                    } catch (createError) {
                        // Handle race condition where another request created it
                        console.error("Daily game creation race:", createError);
                        dailyGame = await prisma.dailyGame.findFirst({
                            where: {
                                date: today,
                                industry: industry,
                            },
                            include: {
                                movie: { include: { hints: true } }
                            }
                        });
                    }
                }
            }
        }

        if (!dailyGame) {
            return NextResponse.json({
                success: false,
                error: 'No daily challenge available yet',
            })
        }

        return NextResponse.json({
            success: true,
            data: {
                id: dailyGame.id,
                date: dailyGame.date,
                industry: dailyGame.industry,
                movieId: dailyGame.movieId,
                totalAttempts: dailyGame.totalAttempts,
                totalWins: dailyGame.totalWins,
                movie: dailyGame.movie,
            },
        })
    } catch (error) {
        console.error('Daily challenge error (Switching to Emergency Mode):', error)

        // EMERGENCY DAILY FALLBACK
        const { FALLBACK_MOVIES } = await import('@/data/fallback-movies');
        // Use query param industry or default to Global
        const url = new URL(request.url);
        const industry = url.searchParams.get('industry') || 'GLOBAL';
        const list = FALLBACK_MOVIES[industry] || FALLBACK_MOVIES.HOLLYWOOD;

        // Deterministic daily pick based on date
        const todayIdx = new Date().getDate() % list.length;
        const movie = list[todayIdx];

        return NextResponse.json({
            success: true,
            data: {
                id: `daily-emergency-${new Date().toISOString().split('T')[0]}`,
                date: new Date(),
                industry: industry,
                movieId: `fallback-${movie.tmdbId}`,
                totalAttempts: 0,
                totalWins: 0,
                movie: {
                    ...movie,
                    id: `fallback-${movie.tmdbId}`,
                    hints: movie.hints
                },
            },
            note: "Served via Emergency Daily Fallback"
        })
    }
}

// POST - Process a daily challenge guess
export async function POST(request) {
    try {
        const body = await request.json()
        const { industry, guess, stage } = body

        if (!industry || !guess) {
            return NextResponse.json({
                success: false,
                error: 'Missing required fields',
            }, { status: 400 })
        }

        const today = new Date()
        today.setUTCHours(0, 0, 0, 0)

        // Get today's daily challenge
        const dailyGame = await prisma.dailyGame.findFirst({
            where: {
                date: today,
                industry,
            },
            include: {
                movie: true,
            },
        })

        if (!dailyGame) {
            return NextResponse.json({
                success: false,
                error: 'No daily challenge found',
            })
        }

        // Check guess
        const normalizedGuess = guess.toLowerCase().trim()
        const normalizedTitle = dailyGame.movie.title.toLowerCase().trim()
        const isCorrect = normalizedGuess === normalizedTitle

        // Update stats
        await prisma.dailyGame.update({
            where: { id: dailyGame.id },
            data: {
                totalAttempts: { increment: 1 },
                ...(isCorrect && { totalWins: { increment: 1 } }),
            },
        })

        return NextResponse.json({
            success: true,
            isCorrect,
            message: isCorrect
                ? 'Correct!'
                : stage >= 4
                    ? `The movie was "${dailyGame.movie.title}"`
                    : 'Wrong guess, try again!',
        })
    } catch (error) {
        console.error('Daily challenge POST error:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to process guess',
            },
            { status: 500 }
        )
    }
}

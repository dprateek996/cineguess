import prisma from '@/lib/prisma'
import { validateGuess, calculateSimilarity } from './validationService'
import { getRandomMovie } from './movieService'

/**
 * The Game State Manager: Handles all game logic and session management
 * The frontend NEVER sees the movieId or title until the game is completed
 */

// Calculate score based on level completed
function calculateScore(level, attempts) {
    const baseScore = 1000
    const levelBonus = (5 - level) * 200
    const attemptPenalty = attempts * 50

    return Math.max(100, baseScore + levelBonus - attemptPenalty)
}

// Get hint for current level
function getHintForLevel(movie, level) {
    if (!movie.hints) {
        throw new Error('Movie has no hints')
    }

    switch (level) {
        case 1:
            return {
                hint: `Hint: Look at the blurred poster image`,
                blurAmount: movie.hints.level1Blur,
            }
        case 2:
            return {
                hint: movie.hints.level2Dialogue,
            }
        case 3:
            return {
                hint: movie.hints.level3Emoji,
            }
        case 4:
            return {
                hint: movie.hints.level4Trivia,
            }
        default:
            return {
                hint: 'No more hints available',
            }
    }
}

// Initialize a new game session
export async function initializeGameSession(industry, userId, gameMode = 'infinite') {
    try {
        const movie = await getRandomMovie(industry)

        if (!movie) {
            throw new Error(`No movies available for ${industry}`)
        }

        const session = await prisma.gameSession.create({
            data: {
                movieId: movie.id,
                userId: userId || null,
                currentLevel: 1,
                attempts: 0,
                gameMode,
                status: 'IN_PROGRESS',
            },
        })

        const { hint, blurAmount } = getHintForLevel(movie, 1)

        return {
            sessionId: session.id,
            currentLevel: 1,
            attempts: 0,
            hint,
            blurAmount,
            status: 'IN_PROGRESS',
            isGameOver: false,
        }
    } catch (error) {
        console.error('Failed to initialize game session:', error)
        throw new Error('Failed to start game. Please try again.')
    }
}

// Process a guess
export async function processGuess(sessionId, guess) {
    try {
        const session = await prisma.gameSession.findUnique({
            where: { id: sessionId },
            include: {
                movie: {
                    include: {
                        hints: true,
                    },
                },
            },
        })

        if (!session) {
            throw new Error('Game session not found')
        }

        if (session.isCompleted) {
            throw new Error('Game already completed')
        }

        const validationResult = validateGuess(guess, session.movie.title)
        const similarity = calculateSimilarity(guess, session.movie.title)

        const newAttempts = session.attempts + 1
        const newGuesses = [...session.guesses, guess]

        // Handle CORRECT guess
        if (validationResult === 'CORRECT') {
            const score = calculateScore(session.currentLevel, newAttempts)

            await prisma.gameSession.update({
                where: { id: sessionId },
                data: {
                    status: 'WON',
                    isCompleted: true,
                    isWon: true,
                    attempts: newAttempts,
                    guesses: newGuesses,
                    score,
                    endTime: new Date(),
                },
            })

            await prisma.movie.update({
                where: { id: session.movieId },
                data: {
                    totalPlays: { increment: 1 },
                    globalSolveRate: {
                        increment: 1 / (session.movie.totalPlays + 1),
                    },
                },
            })

            if (session.userId) {
                await prisma.user.update({
                    where: { id: session.userId },
                    data: {
                        totalGamesPlayed: { increment: 1 },
                        totalWins: { increment: 1 },
                        currentStreak: { increment: 1 },
                        totalScore: { increment: score },
                    },
                })
            }

            return {
                isCorrect: true,
                status: 'CORRECT',
                message: `🎉 Correct! You guessed "${session.movie.title}" in ${newAttempts} attempts!`,
                gameOver: true,
                score,
            }
        }

        // Handle NEAR_MISS
        if (validationResult === 'NEAR_MISS') {
            await prisma.gameSession.update({
                where: { id: sessionId },
                data: {
                    attempts: newAttempts,
                    guesses: newGuesses,
                },
            })

            return {
                isCorrect: false,
                status: 'NEAR_MISS',
                message: `🤏 So close! You're ${similarity}% there. Try again!`,
                currentLevel: session.currentLevel,
                gameOver: false,
            }
        }

        // Handle WRONG guess
        const newLevel = Math.min(session.currentLevel + 1, 4)
        const nextHintData = newLevel > session.currentLevel ? getHintForLevel(session.movie, newLevel) : null

        if (newLevel === 4 && session.currentLevel === 4) {
            await prisma.gameSession.update({
                where: { id: sessionId },
                data: {
                    status: 'LOST',
                    isCompleted: true,
                    isWon: false,
                    attempts: newAttempts,
                    guesses: newGuesses,
                    endTime: new Date(),
                },
            })

            await prisma.movie.update({
                where: { id: session.movieId },
                data: {
                    totalPlays: { increment: 1 },
                },
            })

            return {
                isCorrect: false,
                status: 'WRONG',
                message: `😔 Game Over! The movie was "${session.movie.title}"`,
                gameOver: true,
                score: 0,
            }
        }

        await prisma.gameSession.update({
            where: { id: sessionId },
            data: {
                currentLevel: newLevel,
                attempts: newAttempts,
                guesses: newGuesses,
            },
        })

        return {
            isCorrect: false,
            status: 'WRONG',
            message: `❌ Wrong! Here's another hint...`,
            nextHint: nextHintData?.hint || 'Final hint revealed',
            currentLevel: newLevel,
            gameOver: false,
        }
    } catch (error) {
        console.error('Failed to process guess:', error)
        throw error
    }
}

// Get game session status
export async function getGameSession(sessionId) {
    const session = await prisma.gameSession.findUnique({
        where: { id: sessionId },
        include: {
            movie: {
                include: {
                    hints: true,
                },
            },
        },
    })

    if (!session) {
        throw new Error('Session not found')
    }

    const { hint, blurAmount } = getHintForLevel(session.movie, session.currentLevel)

    return {
        sessionId: session.id,
        currentLevel: session.currentLevel,
        attempts: session.attempts,
        hint,
        blurAmount,
        status: session.status,
        isGameOver: session.isCompleted,
        ...(session.isCompleted && {
            correctAnswer: session.movie.title,
            movie: {
                id: session.movie.id,
                title: session.movie.title,
                releaseYear: session.movie.releaseYear,
                posterPath: session.movie.posterPath,
            },
        }),
    }
}

export default {
    initializeGameSession,
    processGuess,
    getGameSession,
}

import prisma from '@/lib/prisma'
import { validateGuess, calculateSimilarity } from './validationService'

/**
 * CineGuess Game Service - Endless & Rapid Fire Modes
 * 
 * Classic Endless: Progressive difficulty, game over on wrong guess
 * Rapid Fire: Timer-based, 3 lives, bonus for speed
 */

// Difficulty configuration based on round
function getDifficultyConfig(round, mode = 'classic') {
    if (mode === 'rapidfire') {
        // Rapid Fire: Focus on speed, less blur progression
        if (round <= 5) return { blur: 15, maxHints: 3, timeLimit: 30 }
        if (round <= 10) return { blur: 25, maxHints: 2, timeLimit: 20 }
        return { blur: 35, maxHints: 1, timeLimit: 15 }
    }

    // Classic Endless: Progressive blur and hint reduction
    if (round <= 3) return { blur: 20, maxHints: 4, timeLimit: null }
    if (round <= 6) return { blur: 35, maxHints: 3, timeLimit: null }
    if (round <= 10) return { blur: 45, maxHints: 2, timeLimit: null }
    return { blur: 60, maxHints: 1, timeLimit: null }
}

// Generate fallback trivia from TMDB movie data
function generateFallbackTrivia(movie) {
    const year = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : null;
    const budget = movie.budget;
    const revenue = movie.revenue;

    // Try budget/revenue facts first
    if (revenue && revenue > 100000000) {
        const revenueInCrores = Math.round(revenue / 10000000);
        return `This film earned over ₹${revenueInCrores} crores at the worldwide box office.`;
    }

    if (budget && budget > 50000000) {
        const budgetInMillions = Math.round(budget / 1000000);
        return `This film was made with a reported budget of $${budgetInMillions} million.`;
    }

    if (year) {
        return `This ${year} release became a memorable entry in its genre.`;
    }

    return `This film features a critically acclaimed performance that left audiences speechless.`;
}

// Get stage-based clue data for current round
// Stage 1: Scene (backdrop), Stage 2: Dialogue, Stage 3: Emoji, Stage 4: Blurred Poster
function getStageData(movie, stage = 1) {
    const stages = {
        1: {
            type: 'scene',
            data: { backdropPath: movie.backdropPath },
            pointsMultiplier: 4,
            label: 'Scene Clue'
        },
        2: {
            type: 'dialogue',
            data: { dialogue: movie.hints?.level2Dialogue || 'A memorable line from this film...' },
            pointsMultiplier: 3,
            label: 'Famous Dialogue'
        },
        3: {
            type: 'trivia',
            data: { trivia: movie.hints?.level4Trivia || generateFallbackTrivia(movie) },
            pointsMultiplier: 2,
            label: 'Movie Trivia'
        },
        4: {
            type: 'poster',
            data: {
                posterPath: movie.posterPath,
                blurAmount: 25  // Fixed blur for final stage
            },
            pointsMultiplier: 1,
            label: 'Blurred Poster'
        }
    };

    return stages[stage] || stages[1];
}

// Legacy function for backwards compatibility
function getHintsForRound(movie, maxHints) {
    if (!movie.hints) return []

    const allHints = [
        { type: 'poster', text: 'Look at the blurred poster', level: 1 },
        { type: 'dialogue', text: movie.hints.level2Dialogue, level: 2 },
        { type: 'emoji', text: movie.hints.level3Emoji, level: 3 },
        { type: 'trivia', text: movie.hints.level4Trivia, level: 4 },
    ]

    return allHints.slice(0, maxHints)
}

// Calculate score based on performance with stage-based multipliers
function calculateScore(round, stage = 1, timeRemaining = null, mode = 'classic') {
    const baseScore = 100 * round

    // Stage-based multiplier (earlier stage = more points)
    const stageMultipliers = { 1: 4, 2: 3, 3: 2, 4: 1 }
    const stageMultiplier = stageMultipliers[stage] || 1

    // Streak bonus
    let streakMultiplier = 1
    if (round >= 5) streakMultiplier = 1.5
    if (round >= 10) streakMultiplier = 2

    // Time bonus for rapid fire
    const timeBonus = mode === 'rapidfire' && timeRemaining ? timeRemaining * 3 : 0

    return Math.floor((baseScore * stageMultiplier + timeBonus) * streakMultiplier)
}

// Get a random movie, avoiding already played ones
async function getNextMovie(industry, playedMovieIds = []) {
    const where = {
        industry,
        id: { notIn: playedMovieIds },
    }

    const count = await prisma.movie.count({ where })

    if (count === 0) {
        // If all movies played, allow repeats
        const totalCount = await prisma.movie.count({ where: { industry } })
        if (totalCount === 0) {
            throw new Error(`No movies found for ${industry}`)
        }

        const skip = Math.floor(Math.random() * totalCount)
        return prisma.movie.findFirst({
            where: { industry },
            skip,
            include: { hints: true },
        })
    }

    const skip = Math.floor(Math.random() * count)
    return prisma.movie.findFirst({
        where,
        skip,
        include: { hints: true },
    })
}

// Initialize a new game session
export async function initializeGameSession(industry, userId, mode = 'classic') {
    try {
        const movie = await getNextMovie(industry, [])

        if (!movie) {
            throw new Error(`No movies available for ${industry}`)
        }

        const difficultyConfig = getDifficultyConfig(1, mode)
        const hints = getHintsForRound(movie, difficultyConfig.maxHints)
        const stageData = getStageData(movie, 1)  // Start at Stage 1 (scene)

        const session = await prisma.gameSession.create({
            data: {
                movieId: movie.id,
                userId: userId || null,
                currentLevel: 1, // Using as "current round"
                attempts: 0,
                guesses: [movie.id], // Track played movie IDs
                gameMode: mode,
                status: 'IN_PROGRESS',
            },
        })

        return {
            sessionId: session.id,
            currentRound: 1,
            currentStage: 1,
            streak: 0,
            totalScore: 0,
            lives: mode === 'rapidfire' ? 3 : null,
            // Stage-based clue system
            stageData,
            // All stage data for this movie (frontend can cache)
            allStages: {
                1: getStageData(movie, 1),
                2: getStageData(movie, 2),
                3: getStageData(movie, 3),
                4: getStageData(movie, 4),
            },
            // Legacy hints (for backwards compatibility)
            hints,
            blurAmount: difficultyConfig.blur,
            timeLimit: difficultyConfig.timeLimit,
            posterPath: movie.posterPath,
            backdropPath: movie.backdropPath,
            industry,
            mode,
            isGameOver: false,
        }
    } catch (error) {
        console.error('Failed to initialize game session:', error)
        throw new Error('Failed to start game. Please try again.')
    }
}

// Process a guess
export async function processGuess(sessionId, guess, currentStage = 1, timeRemaining = null) {
    try {
        const session = await prisma.gameSession.findUnique({
            where: { id: sessionId },
            include: {
                movie: { include: { hints: true } },
            },
        })

        if (!session) throw new Error('Game session not found')
        if (session.isCompleted) throw new Error('Game already completed')

        const validationResult = validateGuess(guess, session.movie.title)
        const similarity = calculateSimilarity(guess, session.movie.title)
        const mode = session.gameMode
        const currentRound = session.currentLevel
        const difficultyConfig = getDifficultyConfig(currentRound, mode)

        // CORRECT GUESS - Move to next round with new movie
        if (validationResult === 'CORRECT') {
            // Calculate score based on stage (earlier stage = more points)
            const roundScore = calculateScore(
                currentRound,
                currentStage,
                timeRemaining,
                mode
            )

            const newRound = currentRound + 1
            const playedMovieIds = session.guesses

            // Get next movie
            const nextMovie = await getNextMovie(session.movie.industry, playedMovieIds)
            const nextDifficulty = getDifficultyConfig(newRound, mode)
            const nextHints = getHintsForRound(nextMovie, nextDifficulty.maxHints)

            // Update session for next round
            await prisma.gameSession.update({
                where: { id: sessionId },
                data: {
                    movieId: nextMovie.id,
                    currentLevel: newRound,
                    attempts: session.attempts + 1,
                    guesses: [...playedMovieIds, nextMovie.id],
                    score: (session.score || 0) + roundScore,
                },
            })

            return {
                isCorrect: true,
                status: 'CORRECT',
                message: `🎉 Correct! It was "${session.movie.title}"`,
                roundScore,
                totalScore: (session.score || 0) + roundScore,
                currentRound: newRound,
                guessedAtStage: currentStage,  // Track which stage they guessed at
                streak: currentRound, // Streak = rounds completed
                // Next movie data with stage info
                nextMovie: {
                    hints: nextHints,
                    stageData: getStageData(nextMovie, 1),  // Reset to Stage 1
                    allStages: {
                        1: getStageData(nextMovie, 1),
                        2: getStageData(nextMovie, 2),
                        3: getStageData(nextMovie, 3),
                        4: getStageData(nextMovie, 4),
                    },
                    blurAmount: nextDifficulty.blur,
                    timeLimit: nextDifficulty.timeLimit,
                    posterPath: nextMovie.posterPath,
                    backdropPath: nextMovie.backdropPath,
                },
                gameOver: false,
            }
        }

        // NEAR MISS - Give another chance (same movie)
        if (validationResult === 'NEAR_MISS') {
            return {
                isCorrect: false,
                status: 'NEAR_MISS',
                message: `🤏 So close! ${similarity}% match - try again!`,
                currentRound,
                gameOver: false,
            }
        }

        // WRONG GUESS
        if (mode === 'rapidfire') {
            // Rapid Fire: Lose a life, continue if lives remain
            // Note: Lives tracking would need to be passed from frontend
            // For now, we'll handle it on the frontend
            return {
                isCorrect: false,
                status: 'WRONG',
                message: '❌ Wrong! You lost a life.',
                currentRound,
                currentStage,
                correctAnswer: session.movie.title,
                gameOver: false, // Frontend decides based on lives
            }
        }

        // Classic Mode with Stage System:
        // - Stages 1-3: Wrong guess advances to next stage (handled by frontend)
        // - Stage 4: Wrong guess = Game Over
        if (currentStage < 4) {
            // Not at final stage - let frontend advance to next stage
            return {
                isCorrect: false,
                status: 'WRONG',
                message: '❌ Not quite! Try the next clue...',
                currentRound,
                currentStage,
                nextStage: currentStage + 1,
                gameOver: false,
            }
        }

        // At Stage 4 (final stage) - Game Over
        const finalScore = session.score || 0
        const streak = currentRound - 1

        await prisma.gameSession.update({
            where: { id: sessionId },
            data: {
                status: 'LOST',
                isCompleted: true,
                isWon: false,
                endTime: new Date(),
            },
        })

        // Update user stats if logged in
        if (session.userId) {
            await prisma.user.update({
                where: { id: session.userId },
                data: {
                    totalGamesPlayed: { increment: 1 },
                    totalScore: { increment: finalScore },
                    longestStreak: { max: streak },
                },
            })
        }

        return {
            isCorrect: false,
            status: 'WRONG',
            message: `😔 Game Over! The movie was "${session.movie.title}"`,
            correctAnswer: session.movie.title,
            posterPath: session.movie.posterPath,
            finalScore,
            streak,
            gameOver: true,
        }
    } catch (error) {
        console.error('Failed to process guess:', error)
        throw error
    }
}

// End game (for rapid fire when lives = 0 or timer expiry)
export async function endGame(sessionId, reason = 'lives') {
    const session = await prisma.gameSession.findUnique({
        where: { id: sessionId },
        include: { movie: true },
    })

    if (!session) throw new Error('Session not found')

    const streak = session.currentLevel - 1
    const finalScore = session.score || 0

    await prisma.gameSession.update({
        where: { id: sessionId },
        data: {
            status: 'LOST',
            isCompleted: true,
            isWon: false,
            endTime: new Date(),
        },
    })

    return {
        gameOver: true,
        reason,
        correctAnswer: session.movie.title,
        posterPath: session.movie.posterPath,
        finalScore,
        streak,
    }
}

// Get session status
export async function getGameSession(sessionId) {
    const session = await prisma.gameSession.findUnique({
        where: { id: sessionId },
        include: {
            movie: { include: { hints: true } },
        },
    })

    if (!session) throw new Error('Session not found')

    const difficultyConfig = getDifficultyConfig(session.currentLevel, session.gameMode)
    const hints = getHintsForRound(session.movie, difficultyConfig.maxHints)

    return {
        sessionId: session.id,
        currentRound: session.currentLevel,
        totalScore: session.score || 0,
        streak: session.currentLevel - 1,
        hints,
        blurAmount: difficultyConfig.blur,
        timeLimit: difficultyConfig.timeLimit,
        posterPath: session.movie.posterPath,
        mode: session.gameMode,
        isGameOver: session.isCompleted,
        ...(session.isCompleted && {
            correctAnswer: session.movie.title,
        }),
    }
}

export default {
    initializeGameSession,
    processGuess,
    endGame,
    getGameSession,
}

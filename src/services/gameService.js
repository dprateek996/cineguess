import prisma from '@/lib/prisma'
import { validateGuess, calculateSimilarity } from './validationService'
import { seedMovies } from './movieSeeder'
import { STATIC_HINTS } from '../data/static-hints'
import { FALLBACK_MOVIES } from '../data/fallback-movies'

/**
 * CineQuest Game Service - Endless & Rapid Fire Modes
 * 
 * Classic Endless: Progressive difficulty, game over on wrong guess
 * Rapid Fire: Timer-based, 3 lives, bonus for speed
 */

// Difficulty configuration based on round
function getDifficultyConfig(round, mode = 'classic') {
    if (mode === 'rapidfire') {
        // Rapid Fire: 15 second timer, scene-only mode
        return { blur: 4, maxHints: 1, timeLimit: 15, speedBonusWindow: 3 }
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
// Stage 1: Blurred Poster, Stage 2: Dialogue, Stage 3: Scene (Reveal)
function getStageData(movie, stage = 1) {
    // Check static hints first for dialogue
    const staticHint = STATIC_HINTS[movie.title];
    const dialogue = movie.hints?.level2Dialogue || staticHint?.dialogue || 'A famous quote from this movie...';

    const stages = {
        1: {
            type: 'poster',
            data: {
                posterPath: movie.posterPath,
                blurAmount: 15
            },
            pointsMultiplier: 4,
            label: 'Blurred Poster'
        },
        2: {
            type: 'dialogue',
            data: { dialogue: dialogue },
            pointsMultiplier: 2,
            label: 'Famous Dialogue'
        },
        3: {
            type: 'scene',
            data: { backdropPath: movie.backdropPath },
            pointsMultiplier: 1,
            label: 'Movie Scene'
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
        { type: 'scene', text: 'Scene Reveal', level: 3 },
    ]

    return allHints.slice(0, maxHints)
}

// Calculate score based on performance with stage-based multipliers
function calculateScore(round, stage = 1, timeRemaining = null, mode = 'classic', maxTime = 15) {
    const baseScore = 100 * round

    // Stage-based multiplier (earlier stage = more points)
    // Stage 1 (Poster): 4x, Stage 2 (Dialogue): 2x, Stage 3 (Scene): 1x
    const stageMultipliers = { 1: 4, 2: 2, 3: 1 }
    const stageMultiplier = stageMultipliers[stage] || 1

    // Streak bonus
    let streakMultiplier = 1
    if (round >= 5) streakMultiplier = 1.5
    if (round >= 10) streakMultiplier = 2

    // Rapid Fire specific bonuses
    if (mode === 'rapidfire' && timeRemaining !== null) {
        // Speed Bonus: 3x if guessed within first 3 seconds
        const timeUsed = maxTime - timeRemaining
        const speedMultiplier = timeUsed <= 3 ? 3 : 1

        // Time bonus increases with remaining time
        const timeBonus = timeRemaining * 5

        return Math.floor((baseScore + timeBonus) * speedMultiplier * streakMultiplier)
    }

    return Math.floor(baseScore * stageMultiplier * streakMultiplier)
}

// Get a random movie, avoiding already played ones
// Supports progressive difficulty based on 'round'
async function getNextMovie(industry, playedMovieIds = [], retryCount = 0, round = 1) {
    const MAX_RETRIES = 5;
    const where = {
        industry,
        id: { notIn: playedMovieIds },
        // Ensure we only pick movies that have images!
        posterPath: { not: '' },
        backdropPath: { not: '' },
    }

    let movie = null;

    try {
        let count = await prisma.movie.count({ where })

        if (count === 0) {
            console.log(`[GameService] No movies found for ${industry}. Seeding initial batch...`);
            const seededCount = await seedMovies(industry, 5);
            console.log(`[GameService] Seeded ${seededCount} movies.`);

            if (seededCount > 0) {
                // Update count after seeding
                count = await prisma.movie.count({ where });
            }
        } else if (count < 10) {
            console.log(`[GameService] Low movie count (${count}). Triggering background seed.`);
            seedMovies(industry, 5).catch(err => console.error("Background seed failed:", err));
        }

        if (count > 0) {
            // DIFFICULTY LOGIC
            let takePool = 0;
            if (round <= 2) takePool = 15;
            else if (round <= 6) takePool = 40;
            else if (round <= 15) takePool = 100;

            if (takePool > 0) {
                // Fetch candidates sorted by popularity
                const candidates = await prisma.movie.findMany({
                    where,
                    orderBy: { popularity: 'desc' },
                    take: takePool,
                    include: { hints: true }
                });

                if (candidates.length > 0) {
                    const randomIndex = Math.floor(Math.random() * candidates.length);
                    movie = candidates[randomIndex];
                }
            }

            // Fallback: If no candidate found (e.g. pool is empty) or mode is Random
            if (!movie) {
                const skip = Math.floor(Math.random() * count)
                movie = await prisma.movie.findFirst({
                    where,
                    skip,
                    include: { hints: true },
                })
            }
        }
    } catch (dbError) {
        console.error(`[GameService] Database/Seeding Error for ${industry}:`, dbError);
        movie = null; // Ensure we fall through to the static fallback
    }

    // FINAL FALLBACK: If DB is empty/failing, use hardcoded data
    if (!movie) {
        console.warn(`[GameService] EMERGENCY FALLBACK: Using static data for ${industry}`);
        const fallbackList = FALLBACK_MOVIES[industry] || FALLBACK_MOVIES.HOLLYWOOD;
        const randomFallback = fallbackList[Math.floor(Math.random() * fallbackList.length)];

        // Mock the Prisma object structure
        movie = {
            id: `fallback-${randomFallback.tmdbId}`,
            tmdbId: randomFallback.tmdbId,
            title: randomFallback.title,
            releaseYear: randomFallback.releaseYear,
            industry: industry,
            posterPath: randomFallback.posterPath,
            backdropPath: randomFallback.backdropPath,
            hints: randomFallback.hints
        };
    }

    // ADDITIONAL SAFEGUARD: Verify the selected movie has valid images AND valid hints
    const hasValidImages = movie && movie.posterPath && movie.backdropPath;

    // Check for placeholder hints
    const hint = movie?.hints?.level2Dialogue || '';
    const hasPlaceholderHint = hint.startsWith('A memorable quote') ||
        hint.startsWith('A famous quote') ||
        hint.includes('film.'); // Generic pattern often used in fallbacks

    if (movie && (!hasValidImages || hasPlaceholderHint)) {
        console.warn(`Skipping ${movie.title} (Missing images or placeholder hints)`);
        // Don't retry endlessly on fallback data
        if (!movie.id.toString().startsWith('fallback-') && retryCount < MAX_RETRIES) {
            return getNextMovie(industry, [...playedMovieIds, movie.id], retryCount + 1, round);
        }
    }

    return movie
}

// Initialize a new game session
export async function initializeGameSession(industry, userId, mode = 'classic') {
    try {
        // Start at Round 1 (Easy Difficulty)
        const movie = await getNextMovie(industry, [], 0, 1)

        if (!movie) {
            throw new Error(`No movies available for ${industry}`)
        }

        const difficultyConfig = getDifficultyConfig(1, mode)
        const hints = getHintsForRound(movie, difficultyConfig.maxHints)
        const stageData = getStageData(movie, 1)  // Start at Stage 1 (scene)

        let session;
        try {
            session = await prisma.gameSession.create({
                data: {
                    movieId: movie.id,
                    userId: userId || null,
                    currentLevel: 1, // Using as "current round"
                    attempts: 0,
                    guesses: [movie.id], // Track played movie IDs
                    gameMode: mode,
                    status: 'IN_PROGRESS',
                },
            });
        } catch (dbErr) {
            console.error("[GameService] Session Creation Failed (Offline Mode):", dbErr);
            // Critical Fallback: Application-level mock session if DB is dead
            session = {
                id: `offline-${Date.now()}`,
                attempts: 0,
                currentLevel: 1,
                streak: 0,
                status: 'IN_PROGRESS',
                userId: null
            };
        }

        // Rapid Fire: Scene-only mode, no multi-stage hints
        if (mode === 'rapidfire') {
            const sceneStage = getStageData(movie, 3) // Scene is stage 3
            return {
                sessionId: session.id,
                currentRound: 1,
                currentStage: 1, // Always stage 1 in rapid fire (only one stage)
                streak: 0,
                totalScore: 0,
                lives: 3,
                stageData: sceneStage,
                allStages: {
                    1: sceneStage, // Only scene stage in rapid fire
                },
                hints: [],
                blurAmount: difficultyConfig.blur,
                timeLimit: difficultyConfig.timeLimit,
                speedBonusWindow: difficultyConfig.speedBonusWindow || 3,
                posterPath: movie.posterPath,
                backdropPath: movie.backdropPath,
                industry,
                mode,
                isGameOver: false,
            }
        }

        return {
            sessionId: session.id,
            currentRound: 1,
            currentStage: 1,
            streak: 0,
            totalScore: 0,
            lives: null,
            // Stage-based clue system
            stageData,
            // All stage data for this movie (frontend can cache)
            allStages: {
                1: getStageData(movie, 1),
                2: getStageData(movie, 2),
                3: getStageData(movie, 3),
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
    // OFFLINE/EMERGENCY SESSION HANDLING
    if (sessionId.startsWith('emergency-') || sessionId.startsWith('offline-')) {
        return processOfflineGuess(sessionId, guess, currentStage, timeRemaining);
    }

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
            const maxTime = difficultyConfig.timeLimit || 15
            const roundScore = calculateScore(
                currentRound,
                currentStage,
                timeRemaining,
                mode,
                maxTime
            )

            // Check if speed bonus was achieved (rapid fire only)
            const timeUsed = timeRemaining !== null ? maxTime - timeRemaining : null
            const gotSpeedBonus = mode === 'rapidfire' && timeUsed !== null && timeUsed <= 3

            const newRound = currentRound + 1
            const playedMovieIds = session.guesses

            // Get next movie (Pass newRound for difficulty scaling)
            const nextMovie = await getNextMovie(session.movie.industry, playedMovieIds, 0, newRound)
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

            // Prepare next movie data based on mode
            const sceneStage = getStageData(nextMovie, 3)
            const nextMovieData = mode === 'rapidfire' ? {
                hints: [],
                stageData: sceneStage,
                allStages: { 1: sceneStage },
                blurAmount: nextDifficulty.blur,
                timeLimit: nextDifficulty.timeLimit,
                speedBonusWindow: nextDifficulty.speedBonusWindow || 3,
                posterPath: nextMovie.posterPath,
                backdropPath: nextMovie.backdropPath,
            } : {
                hints: nextHints,
                stageData: getStageData(nextMovie, 1),
                allStages: {
                    1: getStageData(nextMovie, 1),
                    2: getStageData(nextMovie, 2),
                    3: getStageData(nextMovie, 3),
                },
                blurAmount: nextDifficulty.blur,
                timeLimit: nextDifficulty.timeLimit,
                posterPath: nextMovie.posterPath,
                backdropPath: nextMovie.backdropPath,
            }

            return {
                isCorrect: true,
                status: 'CORRECT',
                message: gotSpeedBonus
                    ? `⚡ SPEED BONUS! +3x! "${session.movie.title}"`
                    : `🎉 Correct! It was "${session.movie.title}"`,
                roundScore,
                totalScore: (session.score || 0) + roundScore,
                currentRound: newRound,
                guessedAtStage: currentStage,
                streak: currentRound,
                gotSpeedBonus,
                nextMovie: nextMovieData,
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
                // Do NOT expose correctAnswer here to prevent title leak
                gameOver: false, // Frontend decides based on lives
            }
        }

        // Classic Mode with Stage System:
        // - Stages 1-2: Wrong guess advances to next stage (handled by frontend)
        // - Stage 3: Wrong guess = Game Over
        if (currentStage < 3) {
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
        backdropPath: session.movie.backdropPath,
        finalScore,
        streak,
    }
}

// Skip movie in rapid fire (lose a life, get next movie or game over)
export async function skipMovie(sessionId, currentLives = 3) {
    const session = await prisma.gameSession.findUnique({
        where: { id: sessionId },
        include: { movie: true },
    })

    if (!session) throw new Error('Session not found')
    if (session.gameMode !== 'rapidfire') throw new Error('Skip only available in rapid fire mode')

    const newLives = currentLives - 1

    // Game over if no lives left
    if (newLives <= 0) {
        return endGame(sessionId, 'lives')
    }

    // Get next movie
    const currentRound = session.currentLevel
    const playedMovieIds = session.guesses || []
    const nextMovie = await getNextMovie(session.movie.industry, playedMovieIds, 0, currentRound)

    if (!nextMovie) {
        return endGame(sessionId, 'no_movies')
    }

    const difficultyConfig = getDifficultyConfig(currentRound, 'rapidfire')
    const sceneStage = getStageData(nextMovie, 3)

    // Update session with new movie
    await prisma.gameSession.update({
        where: { id: sessionId },
        data: {
            movieId: nextMovie.id,
            guesses: [...playedMovieIds, nextMovie.id],
        },
    })

    return {
        gameOver: false,
        lives: newLives,
        currentRound,
        streak: currentRound - 1,
        totalScore: session.score || 0,
        skippedMovie: session.movie.title,
        nextMovie: {
            hints: [],
            stageData: sceneStage,
            allStages: { 1: sceneStage },
            blurAmount: difficultyConfig.blur,
            timeLimit: difficultyConfig.timeLimit,
            speedBonusWindow: difficultyConfig.speedBonusWindow || 3,
            posterPath: nextMovie.posterPath,
            backdropPath: nextMovie.backdropPath,
        },
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


// Helper for stateless offline guessing
async function processOfflineGuess(sessionId, guess, currentStage, timeRemaining) {
    console.log(`[GameService] Processing Offline Guess for session: ${sessionId}`);

    // Attempt to match guess against ANY fallback movie since we are stateless
    const { FALLBACK_MOVIES } = await import('../data/fallback-movies');
    const allFallbacks = Object.values(FALLBACK_MOVIES).flat();
    const matchedMovie = allFallbacks.find(m => validateGuess(guess, m.title) === 'CORRECT');

    if (matchedMovie) {
        return {
            result: 'CORRECT',
            points: 1000,
            message: "Correct! (Offline Mode)",
            nextRound: {
                round: 2,
                stage: 1,
                // Pick another random fallback
                ...getStageData(allFallbacks[Math.floor(Math.random() * allFallbacks.length)], 1)
            },
            stats: { streak: 1, totalScore: 1000 }
        }
    }

    return {
        result: 'WRONG',
        message: "Wrong guess (or Offline Mode limitation)",
        lives: 3,
        correctAnswer: "Unknown (Offline)"
    }
}

export default {
    initializeGameSession,
    processGuess,
    endGame,
    skipMovie,
    getGameSession,
}

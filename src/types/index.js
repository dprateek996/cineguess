// Type definitions are converted to JSDoc comments for JavaScript

/**
 * @typedef {Object} TMDBMovie
 * @property {number} id
 * @property {string} title
 * @property {string} release_date
 * @property {string} poster_path
 * @property {string} backdrop_path
 * @property {number[]} genre_ids
 * @property {number} vote_average
 * @property {number} vote_count
 * @property {string} original_language
 * @property {string} overview
 */

/**
 * @typedef {Object} MovieHints
 * @property {string} dialogue
 * @property {string} emoji
 * @property {string} trivia
 * @property {string} location
 */

/**
 * @typedef {Object} GameSessionResponse
 * @property {string} sessionId
 * @property {number} currentLevel
 * @property {number} attempts
 * @property {string} hint
 * @property {number} [blurAmount]
 * @property {'IN_PROGRESS'|'WON'|'LOST'} status
 * @property {boolean} isGameOver
 * @property {string} [correctAnswer]
 * @property {Object} [movie]
 */

/**
 * @typedef {Object} GuessResult
 * @property {boolean} isCorrect
 * @property {'CORRECT'|'NEAR_MISS'|'WRONG'} status
 * @property {string} message
 * @property {string} [nextHint]
 * @property {number} [currentLevel]
 * @property {boolean} gameOver
 * @property {number} [score]
 */

/**
 * @typedef {Object} LeaderboardEntry
 * @property {string} userId
 * @property {string} username
 * @property {number} score
 * @property {number} totalWins
 * @property {number} currentStreak
 * @property {number} longestStreak
 */

// Industry configuration for UI
export const INDUSTRY_CONFIG = {
    HOLLYWOOD: {
        name: 'Hollywood',
        description: 'Guess iconic movies from Hollywood',
        gradient: 'from-blue-600 to-cyan-500',
        icon: '🎬',
    },
    BOLLYWOOD: {
        name: 'Bollywood',
        description: 'Guess blockbuster Bollywood films',
        gradient: 'from-orange-500 to-yellow-500',
        icon: '🪔',
    },
    GLOBAL: {
        name: 'Global Cinema',
        description: 'International masterpieces from around the world',
        gradient: 'from-green-500 to-teal-500',
        icon: '🌍',
    },
    ANIME: {
        name: 'Anime',
        description: 'Japanese animation classics',
        gradient: 'from-pink-500 to-rose-500',
        icon: '🎌',
    },
}

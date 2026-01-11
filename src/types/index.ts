import { Industry } from '@prisma/client'

// Type definitions for TMDB API responses
export interface TMDBMovie {
    id: number
    title: string
    release_date: string
    poster_path: string
    backdrop_path: string
    genre_ids: number[]
    vote_average: number
    vote_count: number
    original_language: string
    overview: string
}

// Type for movie hints
export interface MovieHints {
    dialogue: string
    emoji: string
    trivia: string
    location: string
}

// Game session response types
export interface GameSessionResponse {
    sessionId: string
    currentLevel: number
    attempts: number
    hint: string
    blurAmount?: number
    status: 'IN_PROGRESS' | 'WON' | 'LOST'
    isGameOver: boolean
    correctAnswer?: string
    movie?: {
        id: string
        title: string
        releaseYear: number
        posterPath: string
    }
}

// Guess validation response
export interface GuessResult {
    isCorrect: boolean
    status: 'CORRECT' | 'NEAR_MISS' | 'WRONG'
    message: string
    nextHint?: string
    currentLevel?: number
    gameOver: boolean
    score?: number
}

// Leaderboard entry
export interface LeaderboardEntry {
    userId: string
    username: string
    score: number
    totalWins: number
    currentStreak: number
    longestStreak: number
}

// Industry mapping for UI
export const INDUSTRY_CONFIG = {
    HOLLYWOOD: {
        name: 'Hollywood',
        description: 'Guess iconic movies from Hollywood',
        gradient: 'from-blue-600 to-purple-600',
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
} as const

export type IndustryType = keyof typeof INDUSTRY_CONFIG

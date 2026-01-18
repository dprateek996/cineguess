// TMDB API Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || ''
const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p'

// TMDB endpoints
export const TMDB_ENDPOINTS = {
    POPULAR: `${BASE_URL}/movie/popular`,
    MOVIE_DETAILS: (id) => `${BASE_URL}/movie/${id}`,
    SEARCH: `${BASE_URL}/search/movie`,
    DISCOVER: `${BASE_URL}/discover/movie`,
    IMAGE: (path, size = 'w500') => `${IMAGE_BASE_URL}/${size}${path}`,
}

// Helper function to fetch from TMDB (using Bearer token)
export async function fetchFromTMDB(endpoint, params = {}) {
    const url = new URL(endpoint)
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
        headers: {
            'Authorization': `Bearer ${TMDB_API_KEY}`,
            'Content-Type': 'application/json',
        },
    })
    if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`)
    }

    return response.json()
}

// Get popular movies by region
export async function getPopularMovies(region = 'US', page = 1) {
    const params = { page: page.toString() }

    if (region !== 'all') {
        params.region = region
    }

    const data = await fetchFromTMDB(TMDB_ENDPOINTS.POPULAR, params)
    return data.results
}

// Get movie details
export async function getMovieDetails(movieId) {
    return fetchFromTMDB(TMDB_ENDPOINTS.MOVIE_DETAILS(movieId))
}

// Get movie images
export async function getMovieImages(movieId) {
    return fetchFromTMDB(`${BASE_URL}/movie/${movieId}/images`)
}

// Discover movies by criteria
export async function discoverMovies(filters = {}) {
    const params = {
        page: (filters.page || 1).toString(),
        'vote_count.gte': (filters.minVoteCount || 100).toString(),
    }

    // Map industry to TMDB regions/languages
    if (filters.industry === 'BOLLYWOOD') {
        params.with_original_language = 'hi'
        params.region = 'IN'
    } else if (filters.industry === 'HOLLYWOOD') {
        params.with_original_language = 'en'
        params.region = 'US'
    }

    if (filters.year) {
        params.primary_release_year = filters.year.toString()
    }

    const data = await fetchFromTMDB(TMDB_ENDPOINTS.DISCOVER, params)
    return data.results
}

export default {
    getPopularMovies,
    getMovieDetails,
    discoverMovies,
    TMDB_ENDPOINTS,
}

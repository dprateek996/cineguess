/**
 * The Validation Engine: Fuzzy string matching for movie title guesses
 * Uses Levenshtein Distance algorithm for high-precision matching
 */

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1, str2) {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1]
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                )
            }
        }
    }

    return matrix[str2.length][str1.length]
}

// Normalize string for comparison
function normalizeTitle(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '')
        .replace(/^(the|a|an)\s+/i, '')
        .replace(/\s+/g, ' ')
}

// Remove accents/diacritics
function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Validate guess against actual title
export function validateGuess(guess, actualTitle) {
    const normalizedGuess = removeAccents(normalizeTitle(guess))
    const normalizedTitle = removeAccents(normalizeTitle(actualTitle))

    // Exact match
    if (normalizedGuess === normalizedTitle) {
        return 'CORRECT'
    }

    // Calculate distance
    const distance = levenshteinDistance(normalizedGuess, normalizedTitle)
    const maxLength = Math.max(normalizedGuess.length, normalizedTitle.length)

    // Similarity percentage
    const similarity = 1 - distance / maxLength

    if (similarity >= 0.9) {
        return 'CORRECT'
    } else if (similarity >= 0.7) {
        return 'NEAR_MISS'
    }

    // Additional check for substring matches
    if (
        normalizedTitle.includes(normalizedGuess) ||
        normalizedGuess.includes(normalizedTitle)
    ) {
        if (similarity >= 0.6) {
            return 'NEAR_MISS'
        }
    }

    return 'WRONG'
}

// Calculate similarity score (0-100)
export function calculateSimilarity(guess, actualTitle) {
    const normalizedGuess = removeAccents(normalizeTitle(guess))
    const normalizedTitle = removeAccents(normalizeTitle(actualTitle))

    const distance = levenshteinDistance(normalizedGuess, normalizedTitle)
    const maxLength = Math.max(normalizedGuess.length, normalizedTitle.length)

    return Math.round((1 - distance / maxLength) * 100)
}

export default {
    validateGuess,
    calculateSimilarity,
    normalizeTitle,
}

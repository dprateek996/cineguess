import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

// Get the Gemini model
export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-flash-latest',
})

// Structured prompt for generating movie hints
export const generateHintsPrompt = (movieTitle, releaseYear, industry) => {
  return `You are a movie hint generator for a guessing game called CineGuess.
  
Generate exactly 4 hints for the movie "${movieTitle}" (${releaseYear}) from ${industry} cinema.

STRICT RULES:
1. DO NOT mention the movie title or any main character names
2. Each hint should progressively make it easier to guess
3. Return ONLY valid JSON, no markdown or extra text

Return in this EXACT JSON format:
{
  "dialogue": "The MOST ICONIC, INSTANTLY RECOGNIZABLE quote that fans would immediately associate with this film (no character names)",
  "emoji": "3-4 emojis that represent the plot",
  "trivia": "An obscure fact about production/filming",
  "location": "A key filming location or setting in the movie"
}

Example for a Hollywood movie:
{
  "dialogue": "I'll be back",
  "emoji": "🤖💀⚡🔫",
  "trivia": "The iconic motorcycle jump was done without CGI",
  "location": "Los Angeles, 1984"
}

Now generate hints for "${movieTitle}" (${releaseYear}):
`
}

export default geminiModel


import prisma from '@/lib/prisma'
import { TMDB_ENDPOINTS, fetchFromTMDB, getMovieImages } from '@/lib/tmdb'
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Generate hints for a movie using Gemini
async function generateHints(movie) {
    if (!process.env.GEMINI_API_KEY) {
        return {
            level2Dialogue: "A memorable line from this film...",
            level3Emoji: "🎬 🍿 🎥",
            level4Trivia: `Released in ${new Date(movie.release_date).getFullYear()}, this movie was a hit.`
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Generate 3 hints for the movie "${movie.title}" (${new Date(movie.release_date).getFullYear()}).
        Format as JSON with keys: level2Dialogue (famous quote), level3Emoji (3 emojis representing plot), level4Trivia (interesting fact).
        Do not include the movie title in the hints.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from potential markdown code blocks
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(text);
    } catch (error) {
        console.error("Gemini hint generation failed:", error);
        return {
            level2Dialogue: "A memorable line from this film...",
            level3Emoji: "🎬 🍿 🎥",
            level4Trivia: `Released in ${new Date(movie.release_date).getFullYear()}, this movie is well known.`
        };
    }
}

// Select the best textless backdrop
function selectBestBackdrop(images) {
    if (!images || !images.backdrops || images.backdrops.length === 0) return null;

    // Prefer images without text (iso_639_1 is null or 'xx') and high vote count
    const candidates = images.backdrops.filter(img =>
        (img.iso_639_1 === null || img.iso_639_1 === 'xx') && img.width > 1280
    );

    if (candidates.length > 0) {
        // Sort by vote average
        return candidates.sort((a, b) => b.vote_average - a.vote_average)[0].file_path;
    }

    return images.backdrops[0].file_path;
}

export async function seedMovies(industry, count = 5) {
    console.log(`Seeding ${count} movies for ${industry}...`);

    // Map industry to TMDB params
    let params = { page: '1', 'vote_count.gte': '300' };
    if (industry === 'BOLLYWOOD') {
        params.with_original_language = 'hi';
        params.region = 'IN';
    } else if (industry === 'HOLLYWOOD') {
        params.with_original_language = 'en';
    } else if (industry === 'ANIME') {
        params.with_genres = '16'; // Animation
        params.with_original_language = 'ja';
    }

    // specific discovery logic to vary content (randomize page)
    const randomPage = Math.floor(Math.random() * 50) + 1;
    params.page = randomPage.toString();

    try {
        const data = await fetchFromTMDB(TMDB_ENDPOINTS.DISCOVER, params);
        if (!data.results) return [];

        let seeds = 0;
        for (const movie of data.results) {
            if (seeds >= count) break;

            // Check if exists
            const existing = await prisma.movie.findUnique({
                where: { tmdbId: movie.id }
            });

            if (!existing) {
                // Fetch details for images
                const images = await getMovieImages(movie.id);
                const bestBackdrop = selectBestBackdrop(images) || movie.backdrop_path;

                if (!movie.poster_path) {
                    console.log(`Skipping ${movie.title} (no poster)`);
                    continue;
                }

                // Generate AI hints
                const hints = await generateHints(movie);

                await prisma.movie.create({
                    data: {
                        tmdbId: movie.id,
                        title: movie.title,
                        releaseYear: new Date(movie.release_date).getFullYear(),
                        industry: industry,
                        posterPath: movie.poster_path,
                        backdropPath: bestBackdrop,
                        genres: [], // Simplified
                        hints: {
                            create: {
                                level1Blur: 60, // Increased blur for difficulty
                                level2Dialogue: hints.level2Dialogue,
                                level3Emoji: hints.level3Emoji,
                                level4Trivia: hints.level4Trivia
                            }
                        }
                    }
                });
                console.log(`Seeded: ${movie.title}`);
                seeds++;
            }
        }
        return seeds;
    } catch (error) {
        console.error("Seeding failed:", error);
        return 0;
    }
}

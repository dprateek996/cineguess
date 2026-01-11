# CineGuess 🎬

A modern, AI-powered movie guessing game built with Next.js, Prisma, and Google Gemini.

## Features

- 🎭 **Multi-Industry Support**: Hollywood, Bollywood, Global Cinema, and Anime
- 🤖 **AI-Generated Hints**: Powered by Google Gemini for unique, contextual hints
- 🎯 **Progressive Difficulty**: 4 levels of hints from blurred posters to trivia
- 🔐 **Authentication**: Google & GitHub OAuth support
- 🏆 **Leaderboards**: Global and per-category rankings
- 📅 **Daily Challenges**: New daily movies for each category
- 🎨 **Fuzzy Matching**: Advanced Levenshtein distance algorithm for guess validation

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (NeonDB)
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **AI**: Google Gemini Pro
- **Movie Data**: TMDB API
- **Styling**: Tailwind CSS
- **Rate Limiting**: Upstash Redis

## Project Structure

```
cineguess/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # NextAuth endpoints
│   │   │   ├── game/         # Game logic endpoints
│   │   │   ├── leaderboard/  # Leaderboard API
│   │   │   └── daily/        # Daily challenge
│   │   └── ...
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── gemini.ts         # Gemini AI configuration
│   │   ├── tmdb.ts           # TMDB API helpers
│   │   └── auth.ts           # NextAuth configuration
│   ├── services/
│   │   ├── movieService.ts   # Movie hydration & fetching
│   │   ├── validationService.ts # Fuzzy matching logic
│   │   └── gameService.ts    # Game state management
│   └── types/
│       └── index.ts          # TypeScript type definitions
├── prisma/
│   └── schema.prisma         # Database schema
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (NeonDB recommended)
- TMDB API key
- Google Gemini API key
- OAuth credentials (Google/GitHub)

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp env.template .env.local
   ```
   
   Fill in your actual values in `.env.local`:
   - `DATABASE_URL`: Your NeonDB connection string
   - `TMDB_API_KEY`: Get from https://www.themoviedb.org/settings/api
   - `GEMINI_API_KEY`: Get from https://ai.google.dev/
   - OAuth credentials for Google/GitHub
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`

3. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Game Management
- `POST /api/game/init` - Initialize a new game session
- `POST /api/game/guess` - Submit a guess
- `GET /api/game/session?sessionId={id}` - Get current session state

### Leaderboard & Daily
- `GET /api/leaderboard?limit=10` - Get top players
- `GET /api/daily?industry=BOLLYWOOD` - Get today's daily challenge

## Database Schema Highlights

```prisma
enum Industry {
  HOLLYWOOD
  BOLLYWOOD
  GLOBAL
  ANIME
}

model Movie {
  id            String   @id @default(cuid())
  tmdbId        Int      @unique
  title         String
  industry      Industry
  hints         Hint?
  // ...
}

model Hint {
  level1Blur     Int      // Blur amount
  level2Dialogue String   // Famous quote
  level3Emoji    String   // Emoji plot
  level4Trivia   String   // Obscure fact
}
```

## Core Services

### 1. **Hydration Service** (`movieService.ts`)
- Fetches movies from TMDB
- Generates AI hints using Gemini
- Caches everything in database (cost optimization)

### 2. **Validation Engine** (`validationService.ts`)
- Levenshtein distance algorithm
- Handles edge cases (articles, accents, etc.)
- Returns: `CORRECT` | `NEAR_MISS` | `WRONG`

### 3. **Game State Manager** (`gameService.ts`)
- Session initialization
- Progressive hint revelation
- Score calculation
- Never exposes movie title to frontend until game ends

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production
- Set `NEXTAUTH_URL` to your production URL
- Set `NEXT_PUBLIC_APP_URL` to your domain
- Ensure all API keys are configured

## Future Enhancements

- [ ] Rate limiting with Upstash Redis
- [ ] Image proxy for blur protection (prevent DevTools cheating)
- [ ] Dynamic OG images for social sharing
- [ ] Cron job for daily movie selection
- [ ] User profiles and statistics
- [ ] Share game results to Twitter

## License

MIT

## Acknowledgments

- Movie data from [TMDB](https://www.themoviedb.org/)
- AI hints powered by [Google Gemini](https://ai.google.dev/)

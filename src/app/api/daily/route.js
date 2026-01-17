import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams
        const industry = searchParams.get('industry')

        const today = new Date()
        today.setUTCHours(0, 0, 0, 0)

        let dailyGame = await prisma.dailyGame.findFirst({
            where: {
                date: today,
                ...(industry && { industry }),
            },
            include: {
                movie: {
                    include: {
                        hints: true,
                    },
                },
            },
        })

        if (!dailyGame) {
            return NextResponse.json({
                success: false,
                error: 'No daily challenge available yet',
            })
        }

        return NextResponse.json({
            success: true,
            data: {
                id: dailyGame.id,
                date: dailyGame.date,
                industry: dailyGame.industry,
                movieId: dailyGame.movieId,
                totalAttempts: dailyGame.totalAttempts,
                totalWins: dailyGame.totalWins,
            },
        })
    } catch (error) {
        console.error('Daily challenge error:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch daily challenge',
            },
            { status: 500 }
        )
    }
}

import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams
        const limit = parseInt(searchParams.get('limit') || '10')

        const topUsers = await prisma.user.findMany({
            where: {
                totalGamesPlayed: {
                    gt: 0,
                },
            },
            orderBy: [
                { totalScore: 'desc' },
                { totalWins: 'desc' },
            ],
            take: limit,
            select: {
                id: true,
                name: true,
                image: true,
                totalScore: true,
                totalWins: true,
                totalGamesPlayed: true,
                currentStreak: true,
                longestStreak: true,
            },
        })

        return NextResponse.json({
            success: true,
            data: topUsers,
        })
    } catch (error) {
        console.error('Leaderboard error:', error)

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch leaderboard',
            },
            { status: 500 }
        )
    }
}

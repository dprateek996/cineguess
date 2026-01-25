import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams
        const limit = parseInt(searchParams.get('limit') || '50')
        const category = searchParams.get('category')

        const validCategories = ['BOLLYWOOD', 'HOLLYWOOD', 'RAPIDFIRE_BOLLYWOOD', 'RAPIDFIRE_HOLLYWOOD']

        // Build where clause
        const where = {}
        if (category === 'GLOBAL') {
            const grouped = await prisma.leaderboard.groupBy({
                by: ['username'],
                _sum: {
                    highScore: true,
                    moviesGuessed: true,
                },
                orderBy: {
                    _sum: {
                        highScore: 'desc',
                    }
                },
                take: limit,
            })

            const leaderboard = grouped.map((entry, index) => ({
                id: `global-${entry.username}`,
                username: entry.username,
                highScore: entry._sum.highScore || 0,
                moviesGuessed: entry._sum.moviesGuessed || 0,
                rank: index + 1,
                category: 'GLOBAL',
            }))

            return NextResponse.json({
                success: true,
                data: leaderboard,
            })
        }



        // Build where clause
        if (category && validCategories.includes(category)) {
            where.category = category
        }

        const leaderboard = await prisma.leaderboard.findMany({
            where,
            orderBy: [
                { highScore: 'desc' },
                { moviesGuessed: 'desc' },
            ],
            take: limit,
            select: {
                id: true,
                username: true,
                highScore: true,
                category: true,
                moviesGuessed: true,
            },
        })

        // Add rank to each entry
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            ...entry,
            rank: index + 1,
        }))

        return NextResponse.json({
            success: true,
            data: rankedLeaderboard,
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

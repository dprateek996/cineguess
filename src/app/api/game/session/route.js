import { NextResponse } from 'next/server'
import { getGameSession } from '@/services/gameService'

export async function GET(request) {
    try {
        const searchParams = request.nextUrl.searchParams
        const sessionId = searchParams.get('sessionId')

        if (!sessionId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Session ID is required',
                },
                { status: 400 }
            )
        }

        const session = await getGameSession(sessionId)

        return NextResponse.json({
            success: true,
            data: session,
        })
    } catch (error) {
        console.error('Session fetch error:', error)

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch session',
            },
            { status: 500 }
        )
    }
}

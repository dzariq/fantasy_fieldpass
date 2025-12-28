// app/api/leagues/route.ts
import { NextRequest, NextResponse } from 'next/server';
const FANTASY_API_BASE_URL = process.env.FANTASY_API_URL || 'https://n8n.fieldpass.com.my/webhook';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const competitionId = searchParams.get('competition_id');
    const code = searchParams.get('code');

    if (!competitionId || !code) {
        return NextResponse.json(
            { error: 'Missing parameters' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `https://n8n.fieldpass.com.my/webhook/find-league?competition_id=${competitionId}&code=${code}`,
            {
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch leagues');
        }

        const data = await response.json();
        console.log(data)
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching leagues:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leagues' },
            { status: 500 }
        );
    }
}
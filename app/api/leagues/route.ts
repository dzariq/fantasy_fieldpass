// app/api/leagues/route.ts
import { NextRequest, NextResponse } from 'next/server';
const FANTASY_API_BASE_URL = process.env.FANTASY_API_URL || 'https://n8n.fieldpass.com.my/webhook';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const competitionId = searchParams.get('competition_id');
    const ownerId = searchParams.get('owner_id');

    if (!competitionId || !ownerId) {
        return NextResponse.json(
            { error: 'Missing parameters' },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `https://n8n.fieldpass.com.my/webhook/leagues?competition_id=${competitionId}&owner_id=${ownerId}`,
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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
        const response = await fetch(`${FANTASY_API_BASE_URL}/private-league`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any authentication headers if needed
                // 'Authorization': `Bearer ${process.env.FANTASY_API_KEY}`,
            },
            body: JSON.stringify(body)
        });

        console.log(response)
        if (!response.ok) {
            throw new Error('Failed to create league');
        }

        const data = await response.json();
        console.log(data)
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching leagues:', error);
        return NextResponse.json(
            { error: 'Failed to create league 2'},
            { status: 500 }
        );
    }
}
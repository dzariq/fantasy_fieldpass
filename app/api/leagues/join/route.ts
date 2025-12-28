// app/api/leagues/route.ts
import { NextRequest, NextResponse } from 'next/server';
const FANTASY_API_BASE_URL = process.env.FANTASY_API_URL || 'https://n8n.fieldpass.com.my/webhook';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {

  try {
    const body = await request.json();
    
        const response = await fetch(`${FANTASY_API_BASE_URL}/join-league`, {
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
            throw new Error('Failed to join league');
        }

        const data = await response.json();
        console.log(data)
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching leagues:', error);
        return NextResponse.json(
            { error: 'Failed to join league 2'},
            { status: 500 }
        );
    }
}
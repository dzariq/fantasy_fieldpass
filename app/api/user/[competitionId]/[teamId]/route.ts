import { NextResponse } from 'next/server';

// External API configuration
const FANTASY_API_BASE_URL = process.env.FANTASY_API_URL || 'https://n8n.fieldpass.com.my/webhook';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string,competitionId:string }> }
) {
  try {
    const { teamId,competitionId } = await params;
    console.log(`${FANTASY_API_BASE_URL}/get-user-team?entry_id=${teamId}&competition_id=${competitionId}`)

    // Call external API to get team data
    const response = await fetch(`${FANTASY_API_BASE_URL}/get-user-team?entry_id=${teamId}&competition_id=${competitionId}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': `Bearer ${process.env.FANTASY_API_KEY}`,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }
      throw new Error(`API returned ${response.status}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

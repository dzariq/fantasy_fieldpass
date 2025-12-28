import { NextResponse } from 'next/server';

// External API configuration
const FANTASY_API_BASE_URL = process.env.FANTASY_API_URL || 'https://n8n.fieldpass.com.my/webhook';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string, competitionId:string }> }
) {
  try {
    const { id,competitionId } = await params;

    // Call external API to get team data
    const response = await fetch(`${FANTASY_API_BASE_URL}/teams-get?phone=${id}&competition_id=${competitionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': `Bearer ${process.env.FANTASY_API_KEY}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Team not found' },
          { status: 404 }
        );
      }
      throw new Error(`API returned ${response.status}`);
    }
    const data = await response.json();

    return NextResponse.json(data.json);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string, competitionId:string }> }
) {
  try {
    const { id,competitionId } = await params;
    const body = await request.json();

    console.log(body)

    // Call external API to save team data
    const response = await fetch(`${FANTASY_API_BASE_URL}/teams-put?phone=${id}&competition_id=${competitionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add any authentication headers if needed
        // 'Authorization': `Bearer ${process.env.FANTASY_API_KEY}`,
      },
      body: JSON.stringify(body)
    });


    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data.json);

  } catch (error) {
    console.error('Error saving team:', error);
    return NextResponse.json(
      { error: 'Failed to sync to upstream' },
      { status: 500 }
    );
  }
}
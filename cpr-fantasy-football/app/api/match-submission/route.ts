import { NextRequest, NextResponse } from 'next/server';
import { getMatchSubmission, upsertMatchSubmission, deleteMatchSubmission, submissionExists, calculateMomWinners } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const matchKey = request.nextUrl.searchParams.get('matchKey');

    if (!matchKey) {
      return NextResponse.json(
        { error: 'matchKey parameter is required' },
        { status: 400 }
      );
    }

    const submission = await getMatchSubmission(matchKey);
    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchKey, matchData, players } = body;

    console.log('[Match Submission] Received matchKey:', matchKey);
    console.log('[Match Submission] Player names in submission:', players.map((p: any) => p.name));

    if (!matchKey || !matchData || !players) {
      return NextResponse.json(
        { error: 'matchKey, matchData, and players are required' },
        { status: 400 }
      );
    }

    // Check if submission already exists
    const exists = await submissionExists(matchKey);

    // Calculate MoM winners from votes
    const momWinners = await calculateMomWinners(matchKey);
    console.log('[Match Submission] MoM Winners calculated:', JSON.stringify(momWinners, null, 2));

    // Apply MoM results to player data
    const playersWithMom = players.map((player: any) => {
      const playerWithMom = {
        ...player,
        mom1: momWinners.mom1.includes(player.name) ? 1 : 0,
        mom2: momWinners.mom2.includes(player.name) ? 1 : 0,
        mom3: momWinners.mom3.includes(player.name) ? 1 : 0,
      };
      console.log(`[Match Submission] Player ${player.name}: mom1=${playerWithMom.mom1}, mom2=${playerWithMom.mom2}, mom3=${playerWithMom.mom3}`);
      return playerWithMom;
    });

    const submissionId = await upsertMatchSubmission(matchKey, matchData, playersWithMom);

    return NextResponse.json({
      success: true,
      submissionId,
      isUpdate: exists,
      momWinners
    });
  } catch (error) {
    console.error('Error creating/updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to create/update submission' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const password = request.nextUrl.searchParams.get('password');
    const matchKey = request.nextUrl.searchParams.get('matchKey');

    console.log('DELETE request received:', { password: password ? '***' : 'none', matchKey });

    // Simple password check
    if (password !== 'slug') {
      console.log('Incorrect password provided');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!matchKey) {
      console.log('No matchKey provided');
      return NextResponse.json(
        { error: 'matchKey parameter is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete submission for matchKey:', matchKey);
    await deleteMatchSubmission(matchKey);
    console.log('Successfully deleted submission for matchKey:', matchKey);

    return NextResponse.json({
      success: true,
      message: 'Submission deleted successfully. The match will now show Google Sheets data.'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

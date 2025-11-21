import { NextRequest, NextResponse } from 'next/server';
import { submitMomVote, getMomVoteResults, getMomVoteCount } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchKey, playerName } = body;

    if (!matchKey || !playerName) {
      return NextResponse.json(
        { error: 'matchKey and playerName are required' },
        { status: 400 }
      );
    }

    // Submit the vote
    await submitMomVote(matchKey, playerName);

    return NextResponse.json({
      success: true,
      message: 'Vote submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting MoM vote:', error);
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const matchKey = request.nextUrl.searchParams.get('matchKey');

    if (!matchKey) {
      return NextResponse.json(
        { error: 'matchKey parameter is required' },
        { status: 400 }
      );
    }

    // Get vote results for the match
    const results = await getMomVoteResults(matchKey);
    const totalVotes = await getMomVoteCount(matchKey);

    return NextResponse.json({
      matchKey,
      totalVotes,
      results
    });
  } catch (error) {
    console.error('Error fetching MoM vote results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote results' },
      { status: 500 }
    );
  }
}

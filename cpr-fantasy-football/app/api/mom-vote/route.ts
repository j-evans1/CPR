import { NextRequest, NextResponse } from 'next/server';
import { submitMomVote, getMomVoteResults, getMomVoteCount, areMomResultsRevealed, revealMomResults } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchKey, playerName, voterId } = body;

    if (!matchKey || !playerName) {
      return NextResponse.json(
        { error: 'matchKey and playerName are required' },
        { status: 400 }
      );
    }

    // Submit the vote with optional voterId
    await submitMomVote(matchKey, playerName, voterId);

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

    // Check if results are revealed
    const resultsRevealed = await areMomResultsRevealed(matchKey);

    // Get vote results for the match
    const results = await getMomVoteResults(matchKey);
    const totalVotes = await getMomVoteCount(matchKey);

    return NextResponse.json({
      matchKey,
      totalVotes,
      results,
      resultsRevealed
    });
  } catch (error) {
    console.error('Error fetching MoM vote results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vote results' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { matchKey, password } = body;

    if (!matchKey) {
      return NextResponse.json(
        { error: 'matchKey is required' },
        { status: 400 }
      );
    }

    // Check password
    const REVEAL_PASSWORD = 'slug';
    if (password !== REVEAL_PASSWORD) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Reveal the results
    await revealMomResults(matchKey);

    return NextResponse.json({
      success: true,
      message: 'MoM results revealed successfully'
    });
  } catch (error) {
    console.error('Error revealing MoM results:', error);
    return NextResponse.json(
      { error: 'Failed to reveal results' },
      { status: 500 }
    );
  }
}

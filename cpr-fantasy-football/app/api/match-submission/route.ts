import { NextRequest, NextResponse } from 'next/server';
import { getMatchSubmission, upsertMatchSubmission, deleteMatchSubmission, submissionExists } from '@/lib/db';

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

    if (!matchKey || !matchData || !players) {
      return NextResponse.json(
        { error: 'matchKey, matchData, and players are required' },
        { status: 400 }
      );
    }

    // Check if submission already exists
    const exists = await submissionExists(matchKey);

    const submissionId = await upsertMatchSubmission(matchKey, matchData, players);

    return NextResponse.json({
      success: true,
      submissionId,
      isUpdate: exists
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

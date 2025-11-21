import { NextResponse } from 'next/server';
import { getMatchSubmissions } from '@/lib/db';

export async function GET() {
  try {
    const submissions = await getMatchSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

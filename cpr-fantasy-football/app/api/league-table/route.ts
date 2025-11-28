import { NextResponse } from 'next/server';
import { getLeagueTableData } from '@/lib/league-scraper';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

export async function GET() {
  try {
    const data = await getLeagueTableData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in league table API:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch league table',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

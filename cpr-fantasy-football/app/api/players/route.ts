import { NextResponse } from 'next/server';
import { fetchCSV } from '@/lib/data-fetcher';
import { CSV_URLS } from '@/lib/constants';

interface PlayerData {
  Player: string;
}

export async function GET() {
  try {
    const playerData = await fetchCSV<PlayerData>(CSV_URLS.PLAYER_DATA);

    // Extract unique player names, filter out empty/null
    const playerNames = playerData
      .map(row => row.Player?.trim())
      .filter(name => name && name.length > 0)
      .sort();

    return NextResponse.json(playerNames);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    );
  }
}

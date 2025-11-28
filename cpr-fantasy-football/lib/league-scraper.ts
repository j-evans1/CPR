import * as cheerio from 'cheerio';

export interface LeagueTableRow {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface LeagueTableData {
  name: string;
  rows: LeagueTableRow[];
  lastUpdated: string;
}

export async function fetchLeagueTable(divisionSeason: string): Promise<LeagueTableRow[]> {
  const url = `https://fulltime.thefa.com/table.html?divisionseason=${divisionSeason}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      // Cache for 1 hour (3600 seconds)
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const rows: LeagueTableRow[] = [];

    // Find the main table and extract data
    $('table tbody tr').each((index, element) => {
      const cells = $(element).find('td');

      if (cells.length >= 10) {
        const position = parseInt($(cells[0]).text().trim()) || 0;
        const team = $(cells[1]).text().trim();
        const played = parseInt($(cells[2]).text().trim()) || 0;
        const won = parseInt($(cells[3]).text().trim()) || 0;
        const drawn = parseInt($(cells[4]).text().trim()) || 0;
        const lost = parseInt($(cells[5]).text().trim()) || 0;
        const goalsFor = parseInt($(cells[6]).text().trim()) || 0;
        const goalsAgainst = parseInt($(cells[7]).text().trim()) || 0;
        const goalDifference = parseInt($(cells[8]).text().trim()) || 0;
        const points = parseInt($(cells[9]).text().trim()) || 0;

        // Only add valid rows (skip duplicates from home/away tables)
        if (team && position > 0 && !rows.find(r => r.position === position)) {
          rows.push({
            position,
            team,
            played,
            won,
            drawn,
            lost,
            goalsFor,
            goalsAgainst,
            goalDifference,
            points,
          });
        }
      }
    });

    // Sort by position just to be safe
    return rows.sort((a, b) => a.position - b.position);
  } catch (error) {
    console.error('Error fetching league table:', error);
    throw error;
  }
}

export async function getLeagueTableData(): Promise<LeagueTableData> {
  console.log('Fetching CPR league table...');
  const cprTable = await fetchLeagueTable('297360682');

  // Get the league name from the page as well
  const response = await fetch('https://fulltime.thefa.com/table.html?divisionseason=297360682', {
    // Cache for 1 hour (3600 seconds)
    next: { revalidate: 3600 },
  });
  const html = await response.text();
  const $ = cheerio.load(html);
  const leagueName = $('h2').first().text().trim() || 'CPR League';

  return {
    name: leagueName,
    rows: cprTable,
    lastUpdated: new Date().toISOString(),
  };
}

import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface LeagueTableRow {
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

interface LeagueTable {
  name: string;
  rows: LeagueTableRow[];
}

async function fetchLeagueTable(divisionSeason: string): Promise<LeagueTable> {
  const url = `https://fulltime.thefa.com/table.html?divisionseason=${divisionSeason}`;

  let browser;

  try {
    console.log(`Launching browser for ${divisionSeason}...`);
    // Try serverless chromium first (Vercel, AWS Lambda, etc.)
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
      executablePath: await chromium.executablePath(),
      headless: true,
    });
    console.log('Browser launched successfully (serverless)');
  } catch (error) {
    // Fallback to local Chrome/Chromium for development
    console.log('Serverless chromium failed, using local Chromium:', error);
    const puppeteerRegular = await import('puppeteer');
    browser = await puppeteerRegular.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    console.log('Browser launched successfully (local)');
  }

  try {
    const page = await browser.newPage();
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

    // Wait for the table to be populated
    console.log('Waiting for table to load...');
    await page.waitForSelector('table tbody tr', { timeout: 15000 });
    console.log('Table loaded, extracting data...');

    // Extract the data from the page
    const data = await page.evaluate(() => {
      const leagueName = document.querySelector('h2')?.textContent?.trim() ||
                        document.querySelector('.page-title')?.textContent?.trim() ||
                        'League Table';

      const allRows: any[] = [];
      const tableRows = document.querySelectorAll('table tbody tr');

      tableRows.forEach((row) => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 10) {
          const position = parseInt(cells[0]?.textContent?.trim() || '0');
          const team = cells[1]?.textContent?.trim() || '';
          const played = parseInt(cells[2]?.textContent?.trim() || '0');
          const won = parseInt(cells[3]?.textContent?.trim() || '0');
          const drawn = parseInt(cells[4]?.textContent?.trim() || '0');
          const lost = parseInt(cells[5]?.textContent?.trim() || '0');
          const goalsFor = parseInt(cells[6]?.textContent?.trim() || '0');
          const goalsAgainst = parseInt(cells[7]?.textContent?.trim() || '0');
          const goalDifference = parseInt(cells[8]?.textContent?.trim() || '0');
          const points = parseInt(cells[9]?.textContent?.trim() || '0');

          if (team && position > 0) {
            allRows.push({
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

      // Take only the first occurrence of each position (1-10)
      // This filters out duplicate tables (home/away splits)
      const rows: any[] = [];
      const seenPositions = new Set<number>();

      for (const row of allRows) {
        if (!seenPositions.has(row.position)) {
          seenPositions.add(row.position);
          rows.push(row);

          // Stop after we have 10 teams (typical league size)
          if (rows.length >= 10) break;
        }
      }

      return { name: leagueName, rows };
    });

    return data;
  } finally {
    await browser.close();
  }
}

export async function GET() {
  try {
    console.log('Starting league table fetch...');

    // Fetch sequentially to reduce memory usage and avoid timeouts
    console.log('Fetching CPR table...');
    const cprTable = await fetchLeagueTable('297360682');
    console.log('CPR table fetched:', cprTable.rows.length, 'teams');

    console.log('Fetching CPR A table...');
    const cprATable = await fetchLeagueTable('964182765');
    console.log('CPR A table fetched:', cprATable.rows.length, 'teams');

    return NextResponse.json({
      tables: [
        { ...cprTable, id: 'cpr' },
        { ...cprATable, id: 'cpr-a' },
      ],
    });
  } catch (error) {
    console.error('Error fetching league tables:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Failed to fetch league tables',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

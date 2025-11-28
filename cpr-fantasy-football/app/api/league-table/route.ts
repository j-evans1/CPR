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
    // Try serverless chromium first (Vercel, AWS Lambda, etc.)
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
  } catch (error) {
    // Fallback to local Chrome/Chromium for development
    console.log('Using local Chromium for development');
    const puppeteerRegular = await import('puppeteer');
    browser = await puppeteerRegular.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  }

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    // Wait for the table to be populated
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

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
    const [cprTable, cprATable] = await Promise.all([
      fetchLeagueTable('297360682'),
      fetchLeagueTable('964182765'),
    ]);

    return NextResponse.json({
      tables: [
        { ...cprTable, id: 'cpr' },
        { ...cprATable, id: 'cpr-a' },
      ],
    });
  } catch (error) {
    console.error('Error fetching league tables:', error);
    return NextResponse.json(
      { error: 'Failed to fetch league tables' },
      { status: 500 }
    );
  }
}

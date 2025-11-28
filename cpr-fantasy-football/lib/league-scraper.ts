import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

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

export interface LeagueTable {
    id: string;
    name: string;
    rows: LeagueTableRow[];
}

async function fetchTableForDivision(divisionSeason: string): Promise<LeagueTable> {
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
    } catch (error) {
        // Fallback to local Chrome/Chromium for development
        console.log('Serverless chromium failed, using local Chromium:', error);
        const puppeteerRegular = await import('puppeteer');
        browser = await puppeteerRegular.default.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
    }

    try {
        const page = await browser.newPage();
        // Block images and fonts to speed up loading
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
                req.abort();
            } else {
                req.continue();
            }
        });

        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });

        // Wait for the table to be populated
        await page.waitForSelector('table tbody tr', { timeout: 15000 });

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
            const rows: any[] = [];
            const seenPositions = new Set<number>();

            for (const row of allRows) {
                if (!seenPositions.has(row.position)) {
                    seenPositions.add(row.position);
                    rows.push(row);
                    if (rows.length >= 14) break; // Increased limit just in case
                }
            }

            return { name: leagueName, rows };
        });

        return { ...data, id: divisionSeason };
    } finally {
        if (browser) await browser.close();
    }
}

export async function getLeagueTables(): Promise<LeagueTable[]> {
    try {
        // Fetch sequentially
        const cprTable = await fetchTableForDivision('297360682');
        const cprATable = await fetchTableForDivision('964182765');

        return [
            { ...cprTable, id: 'cpr' },
            { ...cprATable, id: 'cpr-a' },
        ];
    } catch (error) {
        console.error('Error fetching league tables:', error);
        throw error;
    }
}

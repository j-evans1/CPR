
import puppeteer from 'puppeteer';

async function fetchLeagueTable(divisionSeason: string) {
    const url = `https://fulltime.thefa.com/table.html?divisionseason=${divisionSeason}`;
    console.log(`Testing scraping for ${divisionSeason}...`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
        const page = await browser.newPage();
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        console.log('Waiting for table selector...');
        await page.waitForSelector('table tbody tr', { timeout: 15000 });
        console.log('Table found.');

        const data = await page.evaluate(() => {
            const rows = document.querySelectorAll('table tbody tr');
            return Array.from(rows).map(row => {
                const cells = row.querySelectorAll('td');
                return {
                    pos: cells[0]?.textContent?.trim(),
                    team: cells[1]?.textContent?.trim(),
                };
            });
        });

        console.log(`Found ${data.length} rows.`);
        console.log('First row:', data[0]);

    } catch (error) {
        console.error('Scraping failed:', error);
    } finally {
        await browser.close();
    }
}

async function main() {
    await fetchLeagueTable('297360682');
}

main();

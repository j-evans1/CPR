import { NextResponse } from 'next/server';
import { getLeagueTables } from '@/lib/league-scraper';
import { upsertLeagueTableData } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum execution time for Vercel Pro

export async function GET(request: Request) {
    try {
        // Verify the request is from Vercel Cron (skip in development)
        if (process.env.NODE_ENV === 'production') {
            const authHeader = request.headers.get('authorization');
            if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
                console.log('Unauthorized cron request');
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        console.log('[Cron] Starting league table scraping...');
        const startTime = Date.now();

        // Scrape the league tables
        const tables = await getLeagueTables();
        console.log(`[Cron] Successfully scraped ${tables.length} league tables`);

        // Store each table in the cache
        for (const table of tables) {
            await upsertLeagueTableData(
                table.id,
                table.name,
                table.rows,
                true
            );
            console.log(`[Cron] Cached table for division: ${table.id} (${table.name})`);
        }

        const duration = Date.now() - startTime;
        console.log(`[Cron] Scraping completed in ${duration}ms`);

        return NextResponse.json({
            success: true,
            message: `Successfully scraped and cached ${tables.length} league tables`,
            tables: tables.map(t => ({ id: t.id, name: t.name, rowCount: t.rows.length })),
            duration,
        });
    } catch (error) {
        console.error('[Cron] Error scraping league tables:', error);

        // Store error state in cache
        try {
            await upsertLeagueTableData(
                'error',
                'Scraping Failed',
                { error: error instanceof Error ? error.message : 'Unknown error' },
                false
            );
        } catch (dbError) {
            console.error('[Cron] Failed to store error state:', dbError);
        }

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to scrape league tables',
            },
            { status: 500 }
        );
    }
}

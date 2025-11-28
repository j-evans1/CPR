import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPlayerStats } from './data-processor';
import * as dataFetcher from './data-fetcher';
import { CSV_URLS, MATCH_COLUMNS } from './constants';

// Mock the data-fetcher module
vi.mock('./data-fetcher', () => ({
    fetchCSV: vi.fn(),
    parseNumber: (val: any) => Number(val) || 0,
    normalizeString: (val: any) => String(val).trim().toLowerCase(),
}));

describe('getPlayerStats', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should aggregate player stats correctly', async () => {
        const mockMatchData = [
            {}, {}, {}, // Skip 3 header rows
            {
                [MATCH_COLUMNS.PLAYER]: 'Player A',
                [MATCH_COLUMNS.APPEARANCE]: 1,
                [MATCH_COLUMNS.GOALS]: 1,
                [MATCH_COLUMNS.ASSISTS]: 0,
                [MATCH_COLUMNS.TOTAL_POINTS]: 10,
            },
            {
                [MATCH_COLUMNS.PLAYER]: 'Player A',
                [MATCH_COLUMNS.APPEARANCE]: 1,
                [MATCH_COLUMNS.GOALS]: 0,
                [MATCH_COLUMNS.ASSISTS]: 1,
                [MATCH_COLUMNS.TOTAL_POINTS]: 5,
            },
            {
                [MATCH_COLUMNS.PLAYER]: 'Player B',
                [MATCH_COLUMNS.APPEARANCE]: 1,
                [MATCH_COLUMNS.GOALS]: 2,
                [MATCH_COLUMNS.ASSISTS]: 0,
                [MATCH_COLUMNS.TOTAL_POINTS]: 15,
            },
        ];

        const mockPlayerData = [
            {
                'Player': 'Player A',
                'Misc-Points': 5,
            },
            {
                'Player': 'Player B',
                'Misc-Points': 0,
            },
        ];

        vi.mocked(dataFetcher.fetchCSV)
            .mockResolvedValueOnce(mockMatchData) // Match Data
            .mockResolvedValueOnce(mockPlayerData); // Player Data

        const stats = await getPlayerStats();

        expect(dataFetcher.fetchCSV).toHaveBeenCalledTimes(2);
        expect(stats).toHaveLength(2);

        // Player A (20 points) - Should be first
        expect(stats[0].name).toBe('Player A');
        expect(stats[0].appearances).toBe(2);
        expect(stats[0].goals).toBe(1);
        expect(stats[0].assists).toBe(1);
        expect(stats[0].fantasyPoints).toBe(20); // 10 + 5 + 5 (Misc)

        // Player B (15 points) - Should be second
        expect(stats[1].name).toBe('Player B');
        expect(stats[1].appearances).toBe(1);
        expect(stats[1].goals).toBe(2);
        expect(stats[1].fantasyPoints).toBe(15);
    });
});

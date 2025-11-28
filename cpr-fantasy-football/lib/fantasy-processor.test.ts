import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFantasyLeague } from './fantasy-processor';
import * as dataFetcher from './data-fetcher';
import { CSV_URLS } from './constants';

// Mock the data-fetcher module
vi.mock('./data-fetcher', () => ({
    fetchCSV: vi.fn(),
    parseNumber: (val: any) => Number(val) || 0,
    normalizeString: (val: any) => String(val).trim().toLowerCase(),
}));

describe('getFantasyLeague', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    it('should process fantasy teams correctly', async () => {
        const mockTeamData = [
            {
                'Team Name': 'Team A',
                'Manager': 'Manager A',
                'Players': 'Player 1',
                'Position': 'Forward',
                'Price': 10,
                'Total-Points': 50,
                'Team-Points': 100,
            },
            {
                'Team Name': 'Team A',
                'Manager': 'Manager A',
                'Players': 'Player 2',
                'Position': 'Defender',
                'Price': 5,
                'Total-Points': 30,
                'Team-Points': 100,
            },
            {
                'Team Name': 'Team B',
                'Manager': 'Manager B',
                'Players': 'Player 3',
                'Position': 'Midfield',
                'Price': 8,
                'Total-Points': 20,
                'Team-Points': 20,
            },
        ];

        vi.mocked(dataFetcher.fetchCSV).mockResolvedValue(mockTeamData);

        const teams = await getFantasyLeague();

        expect(dataFetcher.fetchCSV).toHaveBeenCalledWith(CSV_URLS.TEAM_SELECTION);
        expect(teams).toHaveLength(2);

        // Team A
        expect(teams[0].teamName).toBe('Team A');
        expect(teams[0].totalPoints).toBe(80); // 50 + 30
        expect(teams[0].players).toHaveLength(2);
        expect(teams[0].rank).toBe(1);

        // Team B
        expect(teams[1].teamName).toBe('Team B');
        expect(teams[1].totalPoints).toBe(20);
        expect(teams[1].rank).toBe(2);
    });

    it('should handle empty data', async () => {
        vi.mocked(dataFetcher.fetchCSV).mockResolvedValue([]);

        const teams = await getFantasyLeague();

        expect(teams).toHaveLength(0);
    });

    it('should handle malformed data gracefully', async () => {
        const mockTeamData = [
            {
                'Team Name': 'Team A',
                // Missing Manager
                'Players': 'Player 1',
            },
        ];

        vi.mocked(dataFetcher.fetchCSV).mockResolvedValue(mockTeamData);

        const teams = await getFantasyLeague();

        expect(teams).toHaveLength(0);
    });
});

import { z } from 'zod';

// Helper to coerce numbers from strings with currency symbols
const numericString = z.union([z.number(), z.string()]).transform((val) => {
    if (typeof val === 'number') return val;
    const cleaned = val.replace(/[£$,]/g, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
});

// Helper for optional strings
const optionalString = z.any().transform(val => val ? String(val).trim() : '');

export const PlayerStatSchema = z.object({
    Player: optionalString,
    'Misc-Points': numericString.optional(),
    // Add other fields as needed for validation
});

export const MatchDetailSchema = z.object({
    // Using the column indices as keys because PapaParse with header: true uses them?
    // No, match details uses header: true but the columns are _1, _2 etc.
    // Actually, let's check how it's used.
    // In data-processor.ts: row[MATCH_COLUMNS.PLAYER]
    // MATCH_COLUMNS.PLAYER is '_5'
    // So the keys are _1, _2, etc.
    _1: z.any().optional(), // Date
    _2: z.any().optional(), // Fee
    _3: z.any().optional(), // Gameweek
    _4: z.any().optional(), // Game
    _5: optionalString, // Player
    _6: numericString.optional(), // Appearance
    _7: numericString.optional(), // Goals
    _8: numericString.optional(), // Assists
    _9: numericString.optional(), // MOM
    _10: numericString.optional(), // MOM 2
    _11: numericString.optional(), // MOM 3
    _12: numericString.optional(), // DOD
    _13: numericString.optional(), // Yellow Card
    _14: numericString.optional(), // Red Card
    _15: numericString.optional(), // Own Goal
    _17: numericString.optional(), // Clean Sheet
    _29: numericString.optional(), // Total Points
});

export const TeamSelectionSchema = z.object({
    'Team Name': optionalString,
    'Manager': optionalString,
    'Players': optionalString,
    'Position': optionalString,
    'Price': numericString.optional(),
    'Total-Points': numericString.optional(),
    'Team-Points': numericString.optional(),
});

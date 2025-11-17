// CSV Data Source URLs
export const CSV_URLS = {
  BANK_STATEMENT: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoEocKoPqHp2zwO8xw0jKBeog9PiYoEGThde4N1__g3xDtwQQ19K6ikYtq9PZt3_nEnNJ5tBZGCdnN/pub?gid=583025673&single=true&output=csv',
  MATCH_DETAILS: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoEocKoPqHp2zwO8xw0jKBeog9PiYoEGThde4N1__g3xDtwQQ19K6ikYtq9PZt3_nEnNJ5tBZGCdnN/pub?gid=1732160294&single=true&output=csv',
  PLAYER_DATA: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoEocKoPqHp2zwO8xw0jKBeog9PiYoEGThde4N1__g3xDtwQQ19K6ikYtq9PZt3_nEnNJ5tBZGCdnN/pub?gid=221067498&single=true&output=csv',
  TEAM_SELECTION: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoEocKoPqHp2zwO8xw0jKBeog9PiYoEGThde4N1__g3xDtwQQ19K6ikYtq9PZt3_nEnNJ5tBZGCdnN/pub?gid=254187028&single=true&output=csv',
  SCORING_SYSTEM: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoEocKoPqHp2zwO8xw0jKBeog9PiYoEGThde4N1__g3xDtwQQ19K6ikYtq9PZt3_nEnNJ5tBZGCdnN/pub?gid=1614452776&single=true&output=csv',
  FINES: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoEocKoPqHp2zwO8xw0jKBeog9PiYoEGThde4N1__g3xDtwQQ19K6ikYtq9PZt3_nEnNJ5tBZGCdnN/pub?gid=1129039641&single=true&output=csv',
};

// Match Details CSV Column Indices (after skipping 3 header rows)
// The CSV uses _1, _2, _3 etc. for column names when parsed
export const MATCH_COLUMNS = {
  DATE: '_1',
  FEE: '_2',
  GAMEWEEK: '_3',
  GAME: '_4',
  PLAYER: '_5',
  APPEARANCE: '_6',
  GOALS: '_7',
  ASSISTS: '_8',
  MOM: '_9',
  MOM_2: '_10',
  MOM_3: '_11',
  DOD: '_12',
  YELLOW_CARD: '_13',
  RED_CARD: '_14',
  OWN_GOAL: '_15',
  // _16 is empty column
  CLEAN_SHEET: '_17',
  APPEARANCE_POINTS: '_18',
  GOALS_POINTS: '_19',
  ASSISTS_POINTS: '_20',
  MOM_POINTS: '_21',
  MOM_2_POINTS: '_22',
  MOM_3_POINTS: '_23',
  DOD_POINTS: '_24',
  YELLOW_CARD_POINTS: '_25',
  RED_CARD_POINTS: '_26',
  OWN_GOAL_POINTS: '_27',
  CLEAN_SHEET_POINTS: '_28',
  TOTAL_POINTS: '_29',
} as const;

// Bank Statement CSV Column Indices (NO headers, access by array index)
export const BANK_COLUMNS = {
  DATE: 0,
  DESCRIPTION: 1,
  TYPE: 2,
  CREDIT: 3,
  DEBIT: 4,
  BALANCE: 5,
  PLAYER: 6,
} as const;

// Season Configuration
export const SEASON_CONFIG = {
  SEASON_FEE: 50,
  SEASON_FEE_THRESHOLD: 3, // Number of matches before season fee applies
  PAYMENT_START_DATE: new Date(2025, 7, 1), // August 1, 2025
} as const;

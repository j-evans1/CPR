// TypeScript types for CPR Fantasy Football

export interface PlayerStat {
  name: string;
  appearances: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  fantasyPoints: number;
}

export interface MatchDetail {
  date: string;
  player: string;
  opponent?: string;
  result?: string;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  yellowCard: boolean;
  redCard: boolean;
  [key: string]: any; // Allow for additional fields
}

export interface ScoringRule {
  action: string;
  points: number;
}

export interface FantasyTeam {
  managerName: string;
  players: string[];
  totalPoints: number;
}

export interface Payment {
  playerName: string;
  amountPaid: number;
  amountDue: number;
  balance: number;
}

export interface BankTransaction {
  date: string;
  description: string;
  type: string;
  in: number;
  out: number;
  balance: number;
  player: string;
}

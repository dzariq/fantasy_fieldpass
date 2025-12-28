export interface Player {
  id: number;
  name: string;
  team_id: number;
  image_url: string;
  jersey_number: number;
  team_jersey: string;
  sub_out: number;
  sub_in : number;
  nationality: string;
  minutes_played: number;
  next_match: string;
  position: 'GK' | 'DF' | 'MF' | 'ST';
  rank: number;
  rating: number;
  team_logo: string;
  team_name: string;
  points: number;
  selection: string;
  total_points: string;
  value: number;
  iscaptain?: number;
  isvicecaptain?: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  penalty_missed: number;
  penalty_saved: number;
}

export interface League {
    id: number;
    creator_id: string;
    creator_name: string;
    code : string;
    participants: [];
    start_mw: number;
    end_mw: number;
    max_participants: number;
    fee: number;
    winner_1: number | 0;
    winner_2: number | 0;
    winner_3: number | 0;
    winner_4: number | 0;
    winner_5: number | 0;
    name: string;
    owner: string;
    status: string;
}

export const DUMMY_PLAYERS: Player[] = [
  {
    id: 1,
    name: 'John Doe',
    team_id: 1,
    image_url: '/assets/player-1.png',
    jersey_number: 10,
    nationality: 'England',
    next_match: 'vs Arsenal',
    position: 'MF',
    rank: 1,
    rating: 8.5,
    team_logo: '/assets/team-1.png',
    team_name: 'Manchester United',
    points: 120,
    selection: '45.2%',
    total_points: '856',
    value: 9.5,
    iscaptain: 0,
    isvicecaptain: 0,
  },
  {
    id: 2,
    name: 'Jane Smith',
    team_id: 2,
    image_url: '/assets/player-2.png',
    jersey_number: 9,
    nationality: 'Brazil',
    next_match: 'vs Liverpool',
    position: 'ST',
    rank: 2,
    rating: 9.0,
    team_logo: '/assets/team-2.png',
    team_name: 'Chelsea',
    points: 145,
    selection: '52.8%',
    total_points: '932',
    value: 11.0,
    iscaptain: 1,
    isvicecaptain: 0,
  }
]

export interface Team {
  _id: {
    $oid: string;
  };
  id: number;
  name: string;
  official_name: string;
  short_name: string;
  status: number;
}

export interface Rules {
  _id: {
    $oid: string;
  };
  season: string;
  benchboost: number;
  credit: number;
  deadline: string;
  matchweek: number;
  matchweeks: number;
  max_same_club: number;
  transfer: number;
  triple: number;
  wildcard: number;
  GK: number;
  DF: number;
  MF: number;
  ST: number;
}

export interface Transfer {
  player_in: {
    id: number;
    value: number;
  };
  player_out: {
    id: number;
    value: number;
  };
}

export interface MatchweekRecord {
  transfers: Transfer[];
  triple: boolean;
  benchboost: boolean;
  wildcard: boolean;
  points: number
  is_new?: boolean;
}

export interface Picks {
  formation: string;
  gk: Player[];
  df: Player[];
  mf: Player[];
  st: Player[];
  subgk: Player[];
  sub: Player[];
}

export interface MatchweekData {
  matchweek: number;
  record: MatchweekRecord;
  picks: Picks;
  points: number;
  is_new?: boolean;
}


export interface UserTeam {
  entry_id: string;
  credit: number;
  manager: string;
  total_points: number;
  name: string;
  phone: string;
  bank: string;
  bank_account_number: string;
  bank_account_name: string;
  country_code: string;
  team_data: MatchweekData[];
}
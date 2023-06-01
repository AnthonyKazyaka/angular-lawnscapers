import { ScoreEntry } from "./ScoreEntry";

export interface RankedScoreEntry extends ScoreEntry {
    rank: number;
    name: string;
  }
  
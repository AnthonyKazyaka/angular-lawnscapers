import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { PuzzleData } from '../models/PuzzleData';
import { ScoreEntry } from '../models/ScoreEntry';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(private db: AngularFireDatabase) {}

  async getPuzzlesData(): Promise<PuzzleData[]> {
    const puzzles$ = this.db
      .object<{ [key: string]: PuzzleData }>('puzzles')
      .valueChanges()
      .pipe(
        map((puzzleObj) => {
          if (!puzzleObj) return [];
          return Object.values(puzzleObj);
        })
      );
    const puzzles = await firstValueFrom(puzzles$);
    return puzzles || [];
  }

  async getCommunityPuzzlesData(): Promise<PuzzleData[]> {
    const puzzles$ = this.db
      .object<{ [key: string]: PuzzleData }>('submittedPuzzles')
      .valueChanges()
      .pipe(
        map((puzzleObj) => {
          if (!puzzleObj) return [];
          return Object.values(puzzleObj);
        })
      );
    const puzzles = await firstValueFrom(puzzles$);
    return puzzles || [];
  }

  async savePuzzle(puzzleData: PuzzleData): Promise<void> {
    return this.db.object(`submittedPuzzles/${puzzleData.id}`).set(puzzleData);
  }

  async getLeaderboardScores(puzzleId: string): Promise<ScoreEntry[]> {
    const scores$ = this.db.list<ScoreEntry>(`leaderboards/${puzzleId}`).valueChanges();
    const scores = await firstValueFrom(scores$);
    return scores || [];
  }

  addScoreToLeaderboard(scoreEntry: ScoreEntry): Promise<void> {
    return this.db.list<ScoreEntry>(`leaderboards/${scoreEntry.levelId}`).push(scoreEntry).then(() => {});
  }
}

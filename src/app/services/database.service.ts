import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { PuzzleData } from '../models/PuzzleData';
import { ScoreEntry } from '../models/ScoreEntry';
import { firstValueFrom, map } from 'rxjs';
import { Feedback } from '../models/Feedback';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(private db: AngularFireDatabase) {}

  async getOfficialPuzzlesData(): Promise<PuzzleData[]> {
    return await this.getPuzzlesData('puzzles')
  }

  async getCommunityPuzzlesData(): Promise<PuzzleData[]> {
    return await this.getPuzzlesData('submittedPuzzles')
  }

  async getPuzzlesData(puzzlesKeyName: string): Promise<PuzzleData[]> {
    const puzzles$ = this.db
      .object<{ [key: string]: PuzzleData }>(puzzlesKeyName)
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

  async submitPuzzle(puzzleData: PuzzleData): Promise<void> {
    return this.db.object(`submittedPuzzles/${puzzleData.id}`).set(puzzleData);
  }

  async getLeaderboardScores(puzzleId: string): Promise<ScoreEntry[]> {
    const scores$ = this.db.list<ScoreEntry>(`leaderboards/${puzzleId}`).valueChanges();
    const scores = await firstValueFrom(scores$);
    return scores || [];
  }

  async getAllLeaderboardScores(): Promise<Map<string, ScoreEntry[]>> {
    // First, get the keys (level IDs) of all the leaderboards
    const leaderboardKeys$ = this.db.list<ScoreEntry>('leaderboards').snapshotChanges();
    const leaderboardKeys = await firstValueFrom(leaderboardKeys$);
  
    // Then, create a Promise for each leaderboard to get its scores
    const scorePromises: Promise<ScoreEntry[]>[] = leaderboardKeys.map(async leaderboardKey => {
      if (leaderboardKey.key) {
          const scores$ = this.db.list<ScoreEntry>(`leaderboards/${leaderboardKey.key}`).valueChanges();
          return await firstValueFrom(scores$);
      }
      return [];
    });
  
    // Wait for all the Promises to resolve
    const allScores: ScoreEntry[][] = await Promise.all(scorePromises);
  
    // Then, combine the level IDs with their scores into a Map
    const allScoresMap: Map<string, ScoreEntry[]> = new Map();
    leaderboardKeys.forEach((leaderboardKey, i) => {
      if (leaderboardKey.key){
        allScoresMap.set(leaderboardKey.key, allScores[i]);
      }
    });
  
    return allScoresMap;
  }
  

  addScoreToLeaderboard(scoreEntry: ScoreEntry): Promise<void> {
    return this.db.list<ScoreEntry>(`leaderboards/${scoreEntry.levelId}`).push(scoreEntry).then(() => {});
  }

  async submitFeedback(feedback: Feedback): Promise<void> {
    var timestamp = new Date().getTime();
    return this.db.object(`feedback/${timestamp}`).set(feedback);
  }
}

import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { ScoreEntry } from '../models/ScoreEntry';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  constructor(private databaseService: DatabaseService) {}

  getLeaderboardScores(puzzleId: string): Promise<ScoreEntry[]> {
    return this.databaseService.getLeaderboardScores(puzzleId);
  }

  addScoreToLeaderboard(scoreEntry: ScoreEntry): Promise<void> {
    return this.databaseService.addScoreToLeaderboard(scoreEntry);
  }
}

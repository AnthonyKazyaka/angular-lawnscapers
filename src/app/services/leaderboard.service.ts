import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { ScoreEntry } from '../models/ScoreEntry';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  constructor(private databaseService: DatabaseService) { }

  getLeaderboardScores(puzzleId: string): Promise<ScoreEntry[]> {
    return this.databaseService.getLeaderboardScores(puzzleId);
  }

  async getAllLeaderboardScores(): Promise<Map<string, ScoreEntry[]>> {
    // Let's directly get the Map from the databaseService.
    const leaderboards: Map<string, ScoreEntry[]> = await this.databaseService.getAllLeaderboardScores();
    return leaderboards;
  }
  
  addScoreToLeaderboard(scoreEntry: ScoreEntry): Promise<void> {
    return this.databaseService.addScoreToLeaderboard(scoreEntry);
  }
}

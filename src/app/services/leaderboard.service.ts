import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { GameService } from './game.service';
import { ScoreEntry } from '../models/ScoreEntry';
import { RankedScoreEntry } from '../models/RankedScoreEntry';
import { Puzzle } from '../models/Puzzle';

@Injectable({
  providedIn: 'root',
})
export class LeaderboardService {
  constructor(private databaseService: DatabaseService) { }

  async getLeaderboardScores(puzzleId: string): Promise<ScoreEntry[]> {
    return this.databaseService.getLeaderboardScores(puzzleId);
  }

  async getAllLeaderboardScores(): Promise<Map<string, ScoreEntry[]>> {
    const leaderboards: Map<string, ScoreEntry[]> = await this.databaseService.getAllLeaderboardScores();
    return leaderboards;
  }
  
  async addScoreToLeaderboard(scoreEntry: ScoreEntry): Promise<void> {
    return this.databaseService.addScoreToLeaderboard(scoreEntry);
  }

  convertToRankedScoreEntryMap(scoreEntryMap: Map<string, ScoreEntry[]>, puzzles: Map<string, Puzzle>): Map<string, RankedScoreEntry[]> {
    const rankedScoreEntryMap: Map<string, RankedScoreEntry[]> = new Map();
  
    for (const [levelId, scores] of scoreEntryMap.entries()) {
      const puzzle = puzzles.get(levelId);
      if (!puzzle || !puzzle.name) {
        continue;  // if the puzzle doesn't exist or doesn't have a name, skip this iteration
      }

      console.log('Scores for level ' + puzzle.name + ':', scores);

      const rankedScores: RankedScoreEntry[] = scores.map(score => ({
        ...score,
        rank: 0,  // initialize rank as 0
        name: puzzle.name // set the name from the puzzle
      }));
      rankedScoreEntryMap.set(levelId, rankedScores);
    }

    return rankedScoreEntryMap;
  }

  async getPlayerBestScores(playerName: string): Promise<Map<string, number>> {
    const allScores = await this.getAllLeaderboardScores();
    const playerBestScores = new Map<string, number>();

    allScores.forEach((scores, levelId) => {
      const playerScores = scores.filter(score => score.playerName === playerName);
      if (playerScores.length > 0) {
        const bestScore = Math.min(...playerScores.map(score => score.score));
        playerBestScores.set(levelId, bestScore);
      }
    });

    return playerBestScores;
  }

  sortLeaderboardsByUser(leaderboards: Map<string, RankedScoreEntry[]>, playerName: string): Map<string, RankedScoreEntry[]> {
    const playerLeaderboard: Map<string, RankedScoreEntry[]> = new Map();

    for (const [levelId, scores] of leaderboards.entries()) {
      const uniquePlayerScores: RankedScoreEntry[] = [];
  
      const playerBestScoreMap: Map<string, RankedScoreEntry> = new Map();
      scores.forEach(score => {
        if(!score.playerName || score.playerName.trim() === ''){
          return;
        }

        const currentBestScore = playerBestScoreMap.get(score.playerName);
        if (!currentBestScore || score.score < currentBestScore.score) {
          playerBestScoreMap.set(score.playerName, score);
        } else if (currentBestScore && score.score === currentBestScore.score) {
          if (score.timestamp < currentBestScore.timestamp) {
            playerBestScoreMap.set(score.playerName, score);
          }
        }
      });
  
      uniquePlayerScores.push(...Array.from(playerBestScoreMap.values()));
  
      uniquePlayerScores.sort((a, b) => {
        const scoreDifference = a.score - b.score;
        if (scoreDifference !== 0) {
          return scoreDifference;
        }
        return a.timestamp.localeCompare(b.timestamp);
      });
  
      // Assign rank based on position in the sorted array
      const rankedScores = uniquePlayerScores.map((score, index) => ({
        ...score,
        rank: index + 1
      }));
  
      const playerScores = rankedScores.filter(score => score.playerName === playerName);
  
      if (playerScores.length > 0) {
        playerLeaderboard.set(levelId, rankedScores);
      }
    }
  
    return playerLeaderboard;
  }  
}

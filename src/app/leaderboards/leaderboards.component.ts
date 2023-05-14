import { Component, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { ScoreEntry } from '../models/ScoreEntry';
import { RankedScoreEntry } from '../models/RankedScoreEntry';
import { Puzzle } from '../models/Puzzle';

@Component({
  selector: 'app-leaderboards',
  templateUrl: './leaderboards.component.html',
  styleUrls: ['./leaderboards.component.css']
})
export class LeaderboardsComponent implements OnInit {

  leaderboards: Map<string, RankedScoreEntry[]> = new Map();

  constructor(private gameService: GameService) { }

  async ngOnInit(): Promise<void> {
    const scoreEntryMap: Map<string, ScoreEntry[]> = await this.gameService.getLeaderboards();
    const puzzleData = await this.gameService.getAllPuzzles();
  
    // map each puzzleData into a Puzzle using the constructor
    const puzzles: Map<string, Puzzle> = new Map(puzzleData.map(puzzle => [puzzle.id, new Puzzle(puzzle)]));
  
    this.leaderboards = this.convertToRankedScoreEntryMap(scoreEntryMap, puzzles);
    this.sortLeaderboard();
  }
  
  sortLeaderboard(): void {
    // Create a new map for the player's ranked leaderboard
    const playerLeaderboard: Map<string, RankedScoreEntry[]> = new Map();
  
    // Iterate over each leaderboard
    for (const [levelId, scores] of this.leaderboards.entries()) {
      // Sort the scores of each leaderboard
      scores.sort((a, b) => {
        const scoreDifference = b.score - a.score;
        if (scoreDifference !== 0) {
          return scoreDifference;
        }
        return a.timestamp.localeCompare(b.timestamp);
      });
  
      // Filter the player's scores and get the best one
      const playerScores = scores.filter(score => score.playerName === this.gameService.playerName);
      if (playerScores.length > 0) {
        const bestPlayerScore = playerScores[0];
  
        // Assign rank and add it to playerLeaderboard
        playerLeaderboard.set(levelId, [{
          ...bestPlayerScore,
          rank: scores.indexOf(bestPlayerScore) + 1 // calculate rank in full leaderboard
        }]);
      }
    }
  
    // Replace the leaderboard with the player's leaderboard
    this.leaderboards = playerLeaderboard;
  }  
  
  convertToRankedScoreEntryMap(scoreEntryMap: Map<string, ScoreEntry[]>, puzzles: Map<string, Puzzle>): Map<string, RankedScoreEntry[]> {
    const rankedScoreEntryMap: Map<string, RankedScoreEntry[]> = new Map();
    
    for (const [levelId, scores] of scoreEntryMap.entries()) {
      const rankedScores: RankedScoreEntry[] = scores.map(score => ({
        ...score,
        rank: 0,  // initialize rank as 0
        name: puzzles.get(levelId)?.name || "" // set the name from the puzzles map or an empty string if not found
      }));
      rankedScoreEntryMap.set(levelId, rankedScores);
    }
  
    return rankedScoreEntryMap;
  }
}

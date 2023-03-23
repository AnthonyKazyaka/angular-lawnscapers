import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, map } from 'rxjs';
import { timestamp } from 'rxjs/internal/operators/timestamp';
import { take } from 'rxjs/operators';
import { DatabaseService } from '../database/database.service';
import { Direction, getDirectionOffset } from '../direction/Direction';
import { Player } from '../models/Player';
import { Puzzle } from '../models/Puzzle';
import { PuzzleData } from '../models/PuzzleData';
import { ScoreEntry } from '../models/ScoreEntry';
import { Tile } from '../models/Tile';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  player: Player = new Player({ x: 0, y: 0 });
  puzzle: Puzzle;
  puzzleBoard: Tile[][];
  puzzlesData: PuzzleData[] = [];
  defaultPuzzleData: PuzzleData = {
    height: 5,
    id: "default",
    name: "Default Level 1",
    obstacles: [{x: 1,y: 1},{x: 4,y: 4},{x: 3,y: 0},{x: 0,y: 3}],
    playerStartPosition: {x: 3,y: 1},
    width: 5
  };
  public newestPuzzleId: string;
  
  constructor(private databaseService: DatabaseService) {
    this.puzzle = new Puzzle(this.defaultPuzzleData);
    this.puzzleBoard = this.puzzle.puzzleBoard;
    this.newestPuzzleId = this.puzzle.id;
  }  

  async initializeApp(): Promise<void> {
    await this.loadPuzzlesData();
    const puzzles = this.getSortedPuzzles();
    this.newestPuzzleId = puzzles.length > 0 ? puzzles[0].id : this.defaultPuzzleData.id;
    console.log("Newest puzzle ID:", this.newestPuzzleId);
  }

  get tiles(): Tile[][] {
    return this.puzzle.puzzleBoard;
  }

  getSortedPuzzles(): PuzzleData[] {
    return [...this.puzzlesData].sort((a, b) => b.id.localeCompare(a.id));
  }  

  async saveScore(playerName: string, score: number, levelId: string): Promise<ScoreEntry> {
    const timestamp: string = new Date().toISOString()
    
    const entry: ScoreEntry = {
      playerName,
      score,
      levelId,
      levelId_score_timestamp: `${levelId}_${score}_${timestamp}`,
      timestamp: timestamp,
    };
    
    await this.databaseService.addScoreToLeaderboard(entry);

    return Promise.resolve(entry);
  }

  async getLeaderboard(levelId: string): Promise<ScoreEntry[]> {
    
    console.log("Getting leaderboard for level:", levelId)
    return this.databaseService.getLeaderboardScores(levelId)
        .then((entries: ScoreEntry[]) => {
          return entries.sort((a, b) => a.score - b.score);
        })
  }

  async initializePuzzle(puzzleId: string): Promise<void> {
    console.log('Initializing puzzle with ID:', puzzleId);
  
    if (!this.puzzlesData || this.puzzlesData.length === 0) {
      console.log('Loading puzzles data...');
      await this.loadPuzzlesData();
    }
  
    console.log('Puzzles data:', this.puzzlesData);
  
    const puzzleData = this.puzzlesData.find(pd => pd.id === puzzleId);
  
    if (puzzleData) {
      this.puzzle = new Puzzle(puzzleData);
      this.puzzleBoard = this.puzzle.puzzleBoard; // Add this line to update the puzzleBoard reference
      this.player = new Player({x: puzzleData.playerStartPosition.x, y: puzzleData.playerStartPosition.y});
      this.puzzle.puzzleBoard[this.player.position.y][this.player.position.x].occupier = this.player;
      console.log("Player initialized at:", this.player.position);
    } else {
      throw new Error(`Puzzle with id "${puzzleId}" not found.`);
    } 
  }
  

  private async loadPuzzlesData(): Promise<void> {
    try {
      this.puzzlesData = await this.databaseService.getPuzzlesData();
    } catch (error) {
      console.error('Failed to load puzzle data:', error);
    }
  }

  async loadPuzzle(puzzleId: string): Promise<void> {
    const puzzleData = this.puzzlesData.find((pd) => pd.id === puzzleId);
    if (!puzzleData) {
      throw new Error(`Puzzle with id ${puzzleId} not found in puzzlesData`);
    }

    this.puzzle = new Puzzle(puzzleData);
    this.puzzleBoard = this.puzzle.puzzleBoard;
    puzzleData.obstacles.forEach((obstacle) => {
      this.puzzle.addObstacle(obstacle);
    });
  }

  canMovePlayer(direction: Direction): boolean {
    const desiredDirection = getDirectionOffset(direction);
    const newPosition = {
      x: this.puzzle.player.position.x + desiredDirection.x,
      y: this.puzzle.player.position.y + desiredDirection.y,
    };

    if (
      newPosition.x < 0 ||
      newPosition.x >= this.puzzle.width ||
      newPosition.y < 0 ||
      newPosition.y >= this.puzzle.height
    ) {
      return false;
    }

    const desiredTile = this.puzzleBoard[newPosition.y][newPosition.x];
    return desiredTile.isOccupiable && !desiredTile.isOccupied && !this.puzzle.isComplete;
  }
}

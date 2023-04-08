import { EventEmitter, Injectable } from '@angular/core';
import { Direction, getDirectionOffset } from '../direction/Direction';
import { Player } from '../models/Player';
import { Puzzle } from '../models/Puzzle';
import { PuzzleData } from '../models/PuzzleData';
import { ScoreEntry } from '../models/ScoreEntry';
import { Tile } from '../models/Tile';
import { GameState } from '../models/GameState';
import { BehaviorSubject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PuzzleService } from './puzzle.service';
import { LeaderboardService } from './leaderboard.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  player: Player = new Player({ x: 0, y: 0 });
  playerName: string = '';
  puzzle: Puzzle;
  puzzleBoard: Tile[][];
  puzzlesData: PuzzleData[] = [];
  defaultPuzzleData: PuzzleData = {
    height: 5,
    id: "default",
    creator: "default",
    name: "Default Level 1",
    obstacles: [{ x: 1, y: 1 }, { x: 4, y: 4 }, { x: 3, y: 0 }, { x: 0, y: 3 }],
    playerStartPosition: { x: 2, y: 2 },
    width: 5,
    created_at: new Date().toISOString()
  };
  gameState: GameState = GameState.MainMenu;
  gameState$ = new BehaviorSubject<GameState>(this.gameState);
  puzzlesLoaded$ = new BehaviorSubject<boolean>(false);

  currentPuzzleId: string = '';

  createdPuzzleName: string = '';
  createdPuzzleBoard: string[][] = [];
  createdPuzzlePlayerPosition: { x: number, y: number } = { x: -1, y: -1 };
  createdPuzzleDimensions: { width: number, height: number } = { width: 3, height: 3 };
  createdPuzzleCompleted: boolean = false;

  puzzleCompletedEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  public puzzleTestCompletedEvent: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public newestPuzzleId: string;
  public isPuzzleBeingTested: boolean = false;

  constructor(private puzzleService: PuzzleService, private leaderboardService: LeaderboardService, private fireAuth: AngularFireAuth) {
    this.puzzle = new Puzzle(this.defaultPuzzleData);
    this.puzzleBoard = this.puzzle.puzzleBoard;
    this.newestPuzzleId = this.puzzle.id;
  }

  async initializeApp(): Promise<void> {
    console.log("Initializing app...")
    await this.fireAuth.signInAnonymously().catch((error) => {
      console.error("Error signing in anonymously:", error);
    });

    await this.loadPuzzlesData();
    const puzzles = this.getSortedPuzzles();
    if (puzzles.length > 0) {
      this.newestPuzzleId = puzzles[0].id;
      this.puzzle = new Puzzle(puzzles[0]);
      this.puzzleBoard = this.puzzle.puzzleBoard;
    } else {
      console.warn('No puzzles found. Default puzzle will be used.');
    }
  }  

  get tiles(): Tile[][] {
    return this.puzzle.puzzleBoard;
  }

  setPuzzleTestCompleted(completed: boolean): void {
    this.puzzleTestCompletedEvent.next(completed);
    this.createdPuzzleCompleted = true;
    this.isPuzzleBeingTested = false;
    this.setGameState(GameState.CreatingPuzzle);
  }

  getDisplayBoard(): string[][] {
    return this.puzzle.getDisplayBoard();
  }

  setPuzzleCompleted(completed: boolean): void {
    this.puzzleCompletedEvent.emit(completed);
  }

  setGameState(newState: GameState): void {
    this.gameState = newState;
    this.gameState$.next(newState);
  }

  getSortedPuzzles(): PuzzleData[] {
    // Currently sorted by id in descending order - need to decide how to order the puzzles
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

    await this.leaderboardService.addScoreToLeaderboard(entry);
    return entry;
  }

  async getLeaderboard(levelId: string): Promise<ScoreEntry[]> {
    return this.leaderboardService.getLeaderboardScores(levelId);
  }

  async savePuzzle(puzzleData: PuzzleData): Promise<PuzzleData> {
    const newPuzzleData: PuzzleData = { ...puzzleData, id: puzzleData.id };
    this.createdPuzzleName = '';
    await this.puzzleService.savePuzzle(puzzleData);
    return newPuzzleData;
  }

  async initializePuzzle(puzzleId: string): Promise<void> {
    const puzzleData = this.puzzlesData.find(pd => pd.id === puzzleId);

    if (puzzleData) {
      this.puzzle = new Puzzle(puzzleData);
      this.puzzleBoard = this.puzzle.puzzleBoard; // Add this line to update the puzzleBoard reference
      this.player = new Player({ x: puzzleData.playerStartPosition.x, y: puzzleData.playerStartPosition.y });
      this.puzzle.puzzleBoard[this.player.position.y][this.player.position.x].occupier = this.player;
    } else {
      throw new Error(`Puzzle with id "${puzzleId}" not found.`);
    }
  }

  async initializePuzzleFromData(puzzleData: PuzzleData): Promise<void> {
    this.isPuzzleBeingTested = true;
    if (puzzleData) {
      this.puzzle = new Puzzle(puzzleData);
      this.puzzleBoard = this.puzzle.puzzleBoard; // Add this line to update the puzzleBoard reference
      this.player = new Player({ x: puzzleData.playerStartPosition.x, y: puzzleData.playerStartPosition.y });
      this.puzzle.puzzleBoard[this.player.position.y][this.player.position.x].occupier = this.player;
    } else {
      throw new Error('Provided puzzle data was null');
    }
  }

  async loadPuzzlesData(): Promise<void> {
    try {
      this.puzzlesData = await this.puzzleService.getOfficialPuzzlesData();
      this.puzzlesLoaded$.next(true);
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

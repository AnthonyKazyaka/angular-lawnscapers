import { EventEmitter, Injectable } from '@angular/core';
import { Direction, getDirectionOffset } from '../models/Direction';
import { Player } from '../models/Player';
import { Puzzle } from '../models/Puzzle';
import { PuzzleData } from '../models/PuzzleData';
import { ScoreEntry } from '../models/ScoreEntry';
import { Tile } from '../models/Tile';
import { GameState } from '../models/GameState';
import { BehaviorSubject, Subject } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { PuzzleService } from './puzzle.service';
import { LeaderboardService } from './leaderboard.service';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  player: Player = new Player({ x: 0, y: 0 });
  playerName: string = '';
  theme: string = 'Light';
  puzzle: Puzzle;
  puzzleScore: ScoreEntry | null = null;
  testScores: ScoreEntry[] = [];
  puzzleBoard: Tile[][];
  puzzleData: PuzzleData | null = null;
  puzzlesData: PuzzleData[] = [];
  testPuzzleData: PuzzleData | null = null;
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
  leaderboard: ScoreEntry[] = [];
  
  gameState$ = new Subject<GameState>();
  puzzlesLoaded$ = new Subject<boolean>();

  currentPuzzleId: string = '';
  currentMoveCount: number = 0;

  createdPuzzleName: string = '';
  createdPuzzleBoard: string[][] = [];
  createdPuzzlePlayerPosition: { x: number, y: number } = { x: -1, y: -1 };
  createdPuzzleDimensions: { width: number, height: number } = { width: 3, height: 3 };
  createdPuzzleCompleted: boolean = false;

  puzzleCompletedEvent$: Subject<boolean> = new Subject();
  puzzleTestCompletedEvent$: Subject<boolean> = new Subject();
  newestPuzzleId: string;
  isPuzzleBeingTested: boolean = false;

  constructor(private puzzleService: PuzzleService, private leaderboardService: LeaderboardService, private fireAuth: AngularFireAuth) {
    console.log("GameService: constructor: Initializing...")

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

    this.playerName = localStorage.getItem('playerName') ?? '';

    this.theme = localStorage.getItem('theme') || this.theme;
  }  

  get tiles(): Tile[][] {
    return this.puzzle.puzzleBoard;
  }

  setPuzzleTestCompleted(completed: boolean): void {
    this.puzzleTestCompletedEvent$.next(completed);
    this.createdPuzzleCompleted = true;
    this.leaderboard = [];
    this.setGameState(GameState.CreatingPuzzle);
  }

  getDisplayBoard(): string[][] {
    return this.puzzle.getDisplayBoard();
  }

  setPuzzleCompleted(completed: boolean): void {
    console.log("GameService: Setting Puzzle Completed to ", completed);
    this.setGameState(GameState.Completed);

    console.log(`GameService: puzzleCompletedEvent$ emitted to ${this.puzzleCompletedEvent$.observers.length} observers`)
    this.puzzleCompletedEvent$.next(completed);
  }

  setGameState(newState: GameState): void {
    this.gameState = newState;
    this.gameState$.next(newState);
  }

  getSortedPuzzles(): PuzzleData[] {
    // Currently sorted by id in descending order - need to decide how to order the puzzles
    return [...this.puzzlesData].sort((a, b) => b.id.localeCompare(a.id));
  }

  getAllPuzzles(): PuzzleData[] {
    // Currently sorted by id in descending order - need to decide how to order the puzzles
    return this.puzzlesData;
  }

  createScoreEntry(playerName: string, score: number, levelId: string): ScoreEntry {
    const timestamp: string = new Date().toISOString()

    const entry: ScoreEntry = {
      playerName,
      score,
      levelId,
      levelId_score_timestamp: `${levelId}_${score}_${timestamp}`,
      timestamp: timestamp,
    };

    return entry;
  }

  async getLeaderboard(levelId: string): Promise<ScoreEntry[]> {
    return this.leaderboardService.getLeaderboardScores(levelId);
  }

  async getLeaderboards(): Promise<Map<string, ScoreEntry[]>> {
    return this.leaderboardService.getAllLeaderboardScores();
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
      this.isPuzzleBeingTested = false;
      this.puzzleBoard = this.puzzle.puzzleBoard; // Add this line to update the puzzleBoard reference
      this.player = new Player({ x: puzzleData.playerStartPosition.x, y: puzzleData.playerStartPosition.y });
      this.puzzle.puzzleBoard[this.player.position.y][this.player.position.x].occupier = this.player;
    } else {
      throw new Error(`Puzzle with id "${puzzleId}" not found.`);
    }
  }

  async initializePuzzleFromData(puzzleData: PuzzleData): Promise<void> {
    if (puzzleData) {
      this.setGameState(GameState.TestingPuzzle);
      this.currentMoveCount = 0;
      this.isPuzzleBeingTested = true;
      this.testPuzzleData = puzzleData;
      this.puzzle = new Puzzle(puzzleData);
      this.puzzleBoard = this.puzzle.puzzleBoard; // Add this line to update the puzzleBoard reference
      this.player = new Player({ x: puzzleData.playerStartPosition.x, y: puzzleData.playerStartPosition.y });
      this.puzzle.puzzleBoard[this.player.position.y][this.player.position.x].occupier = this.player;
      this.leaderboard = [];
    } else {
      throw new Error('Provided puzzle data was null');
    }
  }

  async reinitializePuzzleFromData(): Promise<void> {
    if (this.puzzleData) {
      await this.initializePuzzleFromData(this.puzzleData);
    } else {
      throw new Error('Puzzle data was null');
    }
  }

  async loadPuzzlesData(): Promise<void> {
    try {
      this.puzzlesData = (await this.puzzleService.getOfficialPuzzlesData()).concat(await this.puzzleService.getCommunityPuzzlesData());
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

  movePlayer(direction: Direction) {
    console.log("GameService: Moving player in direction", direction);
    if (this.puzzle && this.player && this.canMovePlayer(direction) && !(this.gameState == GameState.Completed)) {
      this.puzzle.player.direction = direction;
      this.puzzle.movePlayerUntilStopped(direction);
      
      this.currentMoveCount++;
      console.log("GameService: Current move count", this.currentMoveCount);

      if (this.puzzle.isComplete) {
          console.log("GameService: Puzzle is complete, handling game completion");
          setTimeout(async () => {
              await this.handleGameCompletion();
          }, 100);
      }
    }
  }

  async handleGameCompletion(): Promise<void> {
    console.log("GameService: Handling game completion");
  
    if (this.puzzle) {
      if (this.isPuzzleBeingTested) {
        console.log("GameService: Puzzle Test Completed");
        this.setPuzzleTestCompleted(true);
        // Add test score to the testScores array
        const testScoreEntry = this.createScoreEntry(this.playerName, this.currentMoveCount, this.puzzle.id);
        this.testScores.push(testScoreEntry);
      } else {
        console.log(`GameService: Puzzle Completed in ${this.currentMoveCount} moves`);
        this.setPuzzleCompleted(true);
        if (!this.isPuzzleBeingTested) {
          await this.submitScore();
        }
      }
    }
  }
  
  async updateLeaderboard(): Promise<void> {
    if (this.puzzle !== null) {
      console.log("GameService: Updating leaderboard")
      this.leaderboard = await this.getLeaderboard(this.puzzle.id);
    }
  }

  async submitScore(): Promise<void> {
    if (this.puzzle !== null) {
      this.puzzleScore = this.createScoreEntry(this.playerName, this.currentMoveCount, this.puzzle.id);
      await this.leaderboardService.addScoreToLeaderboard(this.puzzleScore);
      this.leaderboard = await this.getLeaderboard(this.puzzle.id);
    }
  }

  async submitTestScore(): Promise<void> {
    // Find the best (lowest) score from testScores and submit it
    if (this.testScores.length > 0) {
      const bestTestScore = this.testScores.reduce((min, p) => p.score < min.score ? p : min, this.testScores[0]);
      await this.leaderboardService.addScoreToLeaderboard(bestTestScore);
    }
    this.testScores = []; // Reset test scores
  }

  startPuzzle(puzzleId: string) {
    console.log("GameService: Starting new puzzle with id", puzzleId);
    // Reset the game state
    this.currentMoveCount = 0;
    this.puzzleScore = null;
    this.puzzle.isComplete = false;
  
    // Initialize the new puzzle
    this.initializePuzzle(puzzleId);
  }  
}

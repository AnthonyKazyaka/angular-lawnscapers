import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GameService } from '../services/game.service';
import { PuzzleData } from '../models/PuzzleData';
import { GameState } from '../models/GameState';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-create-puzzle',
  templateUrl: './create-puzzle.component.html',
  styleUrls: ['./create-puzzle.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePuzzleComponent implements OnInit {
  puzzleForm!: FormGroup;
  submitted = false;
  success = false;
  board: string[][] = [];
  playerPosition = { x: -1, y: -1 };
  minWidth = 3;
  maxWidth = 12;
  minHeight = 3;
  maxHeight = 12;

  puzzleCompleted: boolean = false;

  constructor(public gameService: GameService, private changeDetector: ChangeDetectorRef) {
    this.createForm();

    this.gameService.gameState$.subscribe((newState: GameState) => {
      if (newState === GameState.CreatingPuzzle) {
        this.board = this.gameService.createdPuzzleBoard;
        this.playerPosition = this.gameService.createdPuzzlePlayerPosition;
        this.puzzleCompleted = this.gameService.createdPuzzleCompleted;
        this.changeDetector.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.board = this.gameService.createdPuzzleBoard;
    this.playerPosition = this.gameService.createdPuzzlePlayerPosition;
    this.puzzleCompleted = this.gameService.createdPuzzleCompleted;
    this.createForm();
    this.gameService.puzzleTestCompletedEvent.subscribe((completed: boolean) => {
      this.puzzleCompleted = completed;
    });
  }

  createForm(): void {
    this.puzzleForm = new FormGroup({
      creatorName: new FormControl(this.gameService.playerName, Validators.required),
      puzzleName: new FormControl(this.gameService.createdPuzzleName, Validators.required),
      width: new FormControl(this.gameService.createdPuzzleDimensions.width, [Validators.required, Validators.min(3), Validators.max(12)]),
      height: new FormControl(this.gameService.createdPuzzleDimensions.height, [Validators.required, Validators.min(3), Validators.max(12)]),
    });
  }

  onSizeSubmit(): void {
    const width = this.puzzleForm.value.width;
    const height = this.puzzleForm.value.height;
    this.board = Array(height).fill(null).map(() => Array(width).fill('empty'));
    this.gameService.createdPuzzleBoard = this.board;
    this.gameService.createdPuzzleDimensions.width = width; // Add this line
    this.gameService.createdPuzzleDimensions.height = height; // Add this line
    localStorage.setItem('playerName', this.gameService.playerName);
  }

  onCellClick(row: number, col: number): void {
    const cell = this.board[row][col];
    if (cell === 'empty') {
      this.board[row][col] = 'obstacle';
    } else if (cell === 'obstacle') {
      if (this.playerPosition.x !== -1 && this.playerPosition.y !== -1) {
        this.board[this.playerPosition.y][this.playerPosition.x] = 'empty';
      }
      this.board[row][col] = 'player';
      this.playerPosition = { x: col, y: row };
      this.gameService.createdPuzzlePlayerPosition = this.playerPosition;
    } else {
      this.board[row][col] = 'empty';
      this.playerPosition = { x: -1, y: -1 };
    }
  }

  async onSubmit(): Promise<void> {
    console.log("onSubmit")
    if (this.puzzleForm.invalid || !this.validPlayerPosition() || !this.puzzleCompleted) {
      // Show an error message or handle the error
      return;
    }

    // Ask the player if they want to submit the level
    const confirmSubmit = window.confirm('Would you like to submit this level?');

    if (confirmSubmit) {
      const puzzleData: PuzzleData = {
        id: uuidv4(),
        name: this.puzzleForm.value.puzzleName,
        creator: this.puzzleForm.value.creatorName,
        playerStartPosition: this.playerPosition,
        width: this.puzzleForm.value.width,
        height: this.puzzleForm.value.height,
        obstacles: this.getObstaclePositions(),
        created_at: new Date().toISOString(),
      };

      const newPuzzleData = await this.gameService.savePuzzle(puzzleData);
      console.log("Saved puzzle data: ", newPuzzleData);
      this.success = true;
      this.gameService.createdPuzzleCompleted = false;
      this.gameService.createdPuzzleBoard = [];
      this.gameService.createdPuzzlePlayerPosition = { x: -1, y: -1 };
      this.gameService.setGameState(GameState.MainMenu);
    }
  }

  validPlayerPosition(): boolean {
    return this.playerPosition.x !== -1 && this.playerPosition.y !== -1;
  }

  getObstaclePositions(): { x: number; y: number }[] {
    const obstaclePositions = [];

    for (let y = 0; y < this.board.length; y++) {
      for (let x = 0; x < this.board[y].length; x++) {
        if (this.board[y][x] === 'obstacle') {
          obstaclePositions.push({ x, y });
        }
      }
    }

    return obstaclePositions;
  }

  onMainMenu(): void {
    this.gameService.setGameState(GameState.MainMenu);
  }

  async testPuzzle(): Promise<void> {
    const puzzleData: PuzzleData = {
      id: '',
      name: this.puzzleForm.value.puzzleName,
      creator: this.puzzleForm.value.creatorName,
      playerStartPosition: this.playerPosition,
      width: this.puzzleForm.value.width,
      height: this.puzzleForm.value.height,
      obstacles: this.getObstaclePositions(),
      created_at: new Date().toISOString(),
    };

    this.gameService.playerName = this.puzzleForm.value.creatorName;
    localStorage.setItem('playerName', this.gameService.playerName);
    this.gameService.createdPuzzleName = puzzleData.name;
    
    await this.gameService.initializePuzzleFromData(puzzleData);
    
    this.gameService.setGameState(GameState.TestingPuzzle);
  }
}

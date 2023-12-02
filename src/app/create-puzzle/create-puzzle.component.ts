import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GameService } from '../services/game.service';
import { PuzzleData } from '../models/PuzzleData';
import { Puzzle } from '../models/Puzzle';
import { GameState } from '../models/GameState';
import { LevelGeneratorService } from '../services/level-generator.service';
import { v4 as uuidv4 } from 'uuid';
import { Router } from '@angular/router';
import { HelpModalComponent } from '../help-modal/help-modal.component';
import { MatDialog } from '@angular/material/dialog';

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
  minWidth = 4;
  maxWidth = 12;
  minHeight = 4;
  maxHeight = 12;

  puzzleCompleted: boolean = false;
  isPuzzleCompletable: boolean = false;

  constructor(public gameService: GameService, private levelGenerator: LevelGeneratorService, private changeDetector: ChangeDetectorRef, private router: Router, private dialog: MatDialog) {
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
    this.gameService.puzzleTestCompletedEvent$.subscribe((completed: boolean) => {
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

  generateRandomBoard(): void {
    const width = this.puzzleForm.value.width;
    const height = this.puzzleForm.value.height;
  
    const puzzleData = this.levelGenerator.generateRandomLevel(width, height);
    const puzzle = new Puzzle(puzzleData);

    // Update the board with the generated puzzle
    this.board = puzzle.puzzleBoard.map(row => row.map(cell => cell.isOccupiable ? (cell.isOccupied ? 'player' : 'empty') : 'obstacle'));
    this.playerPosition = puzzle.player.position;
    this.gameService.createdPuzzleBoard = this.board;
    this.gameService.createdPuzzleDimensions.width = width;
    this.gameService.createdPuzzleDimensions.height = height;
    this.gameService.createdPuzzlePlayerPosition = this.playerPosition;

    this.updatePuzzleCompleteness();
    //const minimumNumberOfMoves = this.levelGenerator.calculateMinimumMoves(puzzleData);
    // puzzle.minimumNumberOfMoves = minimumNumberOfMoves;
    // console.log(`Minimum number of moves: ${minimumNumberOfMoves}`);
  }
  
  onSizeSubmit(): void {
    const width = this.puzzleForm.value.width;
    const height = this.puzzleForm.value.height;
    this.board = Array(height).fill(null).map(() => Array(width).fill('empty'));
    this.gameService.createdPuzzleBoard = this.board;
    this.gameService.createdPuzzleDimensions.width = width; // Add this line
    this.gameService.createdPuzzleDimensions.height = height; // Add this line
    this.updatePuzzleCompleteness();
  }

  onCellClick(row: number, col: number): void {
    const cell = this.board[row][col];
    this.gameService.testScores = [];

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

    if(this.puzzleCompleted) {
      this.puzzleCompleted = false;
    }

    this.updatePuzzleCompleteness();
  }

  updatePuzzleCompleteness(): void {
    if (this.playerPosition.x < 0 || this.playerPosition.y < 0 || this.playerPosition.x >= this.puzzleForm.value.width || this.playerPosition.y >= this.puzzleForm.value.height) {
      console.error('Invalid player position');
      return;
    }

    const puzzleData: PuzzleData = {
      id: '', // An ID may not be necessary for completeness check
      name: this.puzzleForm.value.puzzleName || '',
      creator: this.puzzleForm.value.creatorName || '',
      playerStartPosition: this.playerPosition ?? { x: -1, y: -1 },
      width: this.puzzleForm.value.width,
      height: this.puzzleForm.value.height,
      obstacles: this.getObstaclePositions(),
      created_at: new Date().toISOString() // This may not be necessary for completeness check
    };

    const puzzle = new Puzzle(puzzleData);
  
    this.isPuzzleCompletable = this.levelGenerator.isLevelCompletable(puzzle);
    this.changeDetector.markForCheck();
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
      await this.gameService.submitTestScore();
      console.log("Saved puzzle data: ", newPuzzleData);
      this.success = true;
      this.gameService.createdPuzzleCompleted = false;
      this.puzzleCompleted = false;
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
    this.router.navigate(['/']);
  }

  openHelpModal(): void {
    this.dialog.open(HelpModalComponent, {
      data: 'create'
    });
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

    this.router.navigate(['/testing']);
  }

  
}

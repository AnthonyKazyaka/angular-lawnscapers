import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GameService } from '../services/game.service';
import { PuzzleData } from '../models/PuzzleData';

@Component({
  selector: 'app-create-puzzle',
  templateUrl: './create-puzzle.component.html',
  styleUrls: ['./create-puzzle.component.css']
})
export class CreatePuzzleComponent implements OnInit {
  puzzleForm: FormGroup;
  submitted = false;
  success = false;
  board: string[][] = [];
  playerPosition = { x: -1, y: -1 };

  puzzleCompleted: boolean = false;

  constructor(private gameService: GameService) {
    this.puzzleForm = new FormGroup({
      creatorName: new FormControl('', Validators.required),
      puzzleName: new FormControl('', Validators.required),
      width: new FormControl('', [Validators.required, Validators.min(1), Validators.max(16)]),
      height: new FormControl('', [Validators.required, Validators.min(1), Validators.max(16)]),
    });
  }

  ngOnInit(): void {
  }

  onSizeSubmit(): void {
    const width = this.puzzleForm.value.width;
    const height = this.puzzleForm.value.height;
    this.board = Array(height).fill(null).map(() => Array(width).fill('empty'));
  }

  onPuzzleCompleted(): void {
    this.puzzleCompleted = true;
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
    } else {
      this.board[row][col] = 'empty';
      this.playerPosition = { x: -1, y: -1 };
    }
  }

 async onSubmit(): Promise<void> {
    if (this.puzzleForm.invalid || !this.validPlayerPosition() || !this.puzzleCompleted) {
      // Show an error message or handle the error
      return;
    }
  
    const { creatorName, puzzleName, width, height } = this.puzzleForm.value;
    const puzzle : PuzzleData = {
      id: this.generatePuzzleId(),
      name: puzzleName,
      creator: creatorName,
      created_at: new Date().getTime().toString(),
      width,
      height,
      playerStartPosition: this.getPlayerStartPosition(),
      obstacles: this.getObstaclesFromBoard(),
    };
  
    try {
      const createdPuzzle = await this.gameService.savePuzzle(puzzle);
      // Navigate to the main menu or show a success message
    } catch (error) {
      // Handle the error, show an error message, or log it
    }
  }
  
  validPlayerPosition(): boolean {
    return this.playerPosition.x >= 0 && this.playerPosition.y >= 0;
  }

  validatePuzzle(puzzleData: PuzzleData): boolean {
    // Implement your puzzle validation logic here
    // Return true if the puzzle is valid, false otherwise
    return true;
  }

  generatePuzzleId(): string {
    // Implement your puzzle ID generation logic here
    // For example, you can use a timestamp or a random string
    return new Date().getTime().toString();
  }

  getPlayerStartPosition(): { x: number; y: number } {
    return { x: this.playerPosition.x, y: this.playerPosition.y };
  }

  getObstaclesFromBoard(): { x: number; y: number }[] {
    const obstacles: { x: number; y: number }[] = [];
    for (let row = 0; row < this.board.length; row++) {
      for (let col = 0; col < this.board[row].length; col++) {
        if (this.board[row][col] === 'obstacle') {
          obstacles.push({ x: col, y: row });
        }
      }
    }
    return obstacles;
  }
}


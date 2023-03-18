import { Component, OnInit, HostListener } from '@angular/core';
import { GameService, Direction, ScoreEntry, Player, Puzzle } from '../game.service';
import { Observable, EMPTY } from 'rxjs';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  boardDisplay: string[][];
  playerName: string = '';
  gameStarted: boolean = false;
  gameCompleted: boolean = false;
  leaderboard: Observable<ScoreEntry[]>;

  constructor(private gameService: GameService) {
    this.boardDisplay = this.getBoardDisplay();
    this.leaderboard = EMPTY;
  }

  ngOnInit(): void {
    this.newPuzzle();
    this.gameService.puzzle.addObstacle({ x: 1, y: 1 });
    this.gameService.puzzle.addObstacle({ x: 4, y: 4 });
    this.gameService.puzzle.addObstacle({ x: 3, y: 0 });
    this.gameService.puzzle.addObstacle({ x: 0, y: 3 });
    this.boardDisplay = this.getBoardDisplay();
  }

  startGame() {
    this.gameStarted = true;
    this.gameCompleted = false;
    this.boardDisplay = this.getBoardDisplay();
  }  
  
  completeGame() {
    this.gameCompleted = true;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    let direction: Direction | null = null;
    switch (event.key) {
      case 'ArrowUp':
        direction = Direction.Up;
        break;
      case 'ArrowDown':
        direction = Direction.Down;
        break;
      case 'ArrowLeft':
        direction = Direction.Left;
        break;
      case 'ArrowRight':
        direction = Direction.Right;
        break;
    }

    if (direction !== null) {
      this.handleSwipe(direction);
    }
  }

  handleSwipe(direction: Direction): void {
    this.gameService.puzzle.movePlayerUntilStopped(direction);
    this.boardDisplay = this.getBoardDisplay();
    if (this.gameService.puzzle.isComplete) {
      setTimeout(() => {
        this.handleGameCompletion();
      }, 100);
    }
  }  

  handleGameCompletion(): void {
    this.gameCompleted = true;
    this.gameService.saveScore(this.playerName, this.gameService.puzzle.moveCount, this.gameService.puzzle.puzzleId).then(() => {
      this.leaderboard = this.gameService.getLeaderboard(this.gameService.puzzle.puzzleId);
    });
    this.startNewGame();
  }
  

  submitScore(): void {
    this.gameService.saveScore(this.playerName, this.gameService.puzzle.moveCount, this.gameService.puzzle.puzzleId).then(() => {
      this.leaderboard = this.gameService.getLeaderboard(this.gameService.puzzle.puzzleId);
    });
  }

  // Optionally accept in a string parameter to generate a new puzzle
  newPuzzle(levelId?: string): void {
    // Generate a new puzzle name
    const puzzleName = levelId !== undefined ? levelId : `testLevel`;
    
    this.gameService.puzzle = new Puzzle(puzzleName, 5, 5, { x: 3, y: 1 });
    this.leaderboard = this.gameService.getLeaderboard(puzzleName);
  }

  private getBoardDisplay(): string[][] {
    const board = this.gameService.puzzleBoard;
    const display: string[][] = [];
  
    for (let i = 0; i < board.length; i++) {
      const row: string[] = [];
      for (let j = 0; j < board[i].length; j++) {
        const tile = board[j][i];
        if (tile.occupier instanceof Player) {
          row.push('player');
        } else if (!tile.isOccupiable) {
          row.push('obstacle');
        } else if (tile.visited) {
          row.push('visited');
        } else {
          row.push('unvisited');
        }
      }
      display.push(row);
    }
  
    return display;
  }
  

  startNewGame(): void {
    this.leaderboard = EMPTY;
    
    this.newPuzzle();
    this.gameService.puzzle.addObstacle({ x: 1, y: 1 });
    this.gameService.puzzle.addObstacle({ x: 4, y: 4 });
    this.gameService.puzzle.addObstacle({ x: 3, y: 0 });
    this.gameService.puzzle.addObstacle({ x: 0, y: 3 });
    this.boardDisplay = this.getBoardDisplay();
  }
}

import { Component, OnInit, HostListener } from '@angular/core';
import { GameService, Direction, Player } from '../game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  boardDisplay: string[][];

  constructor(private gameService: GameService) {
    this.boardDisplay = this.getBoardDisplay();
  }

  ngOnInit(): void {
    this.gameService.puzzle.addObstacle({ x: 1, y: 1 });
    this.gameService.puzzle.addObstacle({ x: 4, y: 4 });
    this.gameService.puzzle.addObstacle({ x: 3, y: 0 });
    this.gameService.puzzle.addObstacle({ x: 0, y: 3 });
    this.boardDisplay = this.getBoardDisplay();
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
      this.gameService.puzzle.movePlayerUntilStopped(direction);
      this.boardDisplay = this.getBoardDisplay();
      if (this.gameService.puzzle.isComplete) {
        setTimeout(() => {
          alert(`You completed the board in ${this.gameService.puzzle.moveCount} moves. Think you can do better next time?`);
        }, 100);
      }
    }
  }

  handleSwipe(direction: Direction): void {
    this.gameService.puzzle.movePlayerUntilStopped(direction);
    this.boardDisplay = this.getBoardDisplay();
    if (this.gameService.puzzle.isComplete) {
      setTimeout(() => {
        alert(`You completed the board in ${this.gameService.puzzle.moveCount} moves. Think you can do better next time?`);
      }, 100);
    }
  }  

  private getBoardDisplay(): string[][] {
    const board = this.gameService.puzzleBoard;
    const display: string[][] = [];
  
    for (let i = 0; i < board.length; i++) {
      const row: string[] = [];
      for (let j = 0; j < board[i].length; j++) {
        const tile = board[i][j];
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
  
}

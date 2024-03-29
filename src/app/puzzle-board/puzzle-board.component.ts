import { Component, OnInit, Input, Output, EventEmitter, HostListener, ChangeDetectorRef, SimpleChanges, OnChanges } from '@angular/core';
import { Direction } from '../models/Direction';
import { Puzzle } from "../models/Puzzle";
import { Player } from "../models/Player";

@Component({
  selector: 'app-puzzle-board',
  templateUrl: './puzzle-board.component.html',
  styleUrls: ['./puzzle-board.component.css']
})
export class PuzzleBoardComponent implements OnInit, OnChanges {
  @Input() boardDisplay: string[][] = [];
  @Input() puzzle: Puzzle | null = null;
  @Input() player: Player | null = null;
  @Output() movePlayer = new EventEmitter<Direction>();

  constructor(private changeDetector: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.updateBoardDisplay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['puzzle'] || changes['player']) {
      this.updateBoardDisplay();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if(this.puzzle && !this.puzzle.isComplete) {
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
        this.handleMovePlayer(direction);
      }
    }
  }

  handleMovePlayer(direction: Direction): void {
    if(this.puzzle && !this.puzzle.isComplete && this.player) {
      this.movePlayer.emit(direction);
    }
  }
  
  updateBoardDisplay(): void {
    if (this.puzzle && this.player) {
      this.boardDisplay = this.puzzle.getDisplayBoard();
      this.changeDetector.detectChanges();
    }
  }

  isGrassCell(cell: string): boolean {
    return cell.includes('visited'); // Adjust based on your logic
  }
  
  isPlayerCell(cell: string): boolean {
    return cell.startsWith('player');
  }  

  getCellClass(cell: string): string {
    // Implement logic to determine the CSS class based on the cell value
    if (this.isPlayerCell(cell)) {
      // Return the CSS class for the player
      return 'player ' + cell.split(' ')[1]; // Assuming the format is "player [direction]"
    } else {
      // Return the CSS class for other cell types (e.g., 'visited', 'unvisited', 'obstacle')
      return cell;
    }
  }
}

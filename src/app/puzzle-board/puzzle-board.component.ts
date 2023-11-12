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
  @Output() gameCompleted = new EventEmitter<void>();
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
  
  onSwipe(direction: Direction): void {
    this.handleMovePlayer(direction);
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
      this.handleMovePlayer(direction);
    }
  }

  handleMovePlayer(direction: Direction): void {
    if(this.puzzle && !this.puzzle.isComplete && this.player)
    {
      this.player.direction = direction;
      this.puzzle.player.direction = direction;
      this.movePlayer.emit(direction);
      this.updateBoardDisplay();
      this.changeDetector.detectChanges(); // Manually trigger change detection
    }
  }
  
  updateBoardDisplay(): void {
    if (this.puzzle && this.player) {
      this.boardDisplay = this.puzzle.getDisplayBoard();
      this.changeDetector.detectChanges(); // Manually trigger change detection
    }
  }
}

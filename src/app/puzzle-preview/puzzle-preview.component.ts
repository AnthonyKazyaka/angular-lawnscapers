import { Component, Input } from '@angular/core';
import { PuzzleData } from '../models/PuzzleData';

@Component({
  selector: 'app-puzzle-preview',
  templateUrl: './puzzle-preview.component.html',
  styleUrls: ['./puzzle-preview.component.css']
})
export class PuzzlePreviewComponent {
  @Input() puzzle!: PuzzleData;

  constructor() {}

  getCellClass(x: number, y: number): string {
    if (this.puzzle.playerStartPosition.x === x && this.puzzle.playerStartPosition.y === y) {
      return 'player';
    }

    if (this.puzzle.obstacles.some(o => o.x === x && o.y === y)) {
      return 'obstacle';
    }

    return 'unvisited';
  }
}

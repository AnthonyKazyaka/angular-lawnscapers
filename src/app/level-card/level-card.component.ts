import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PuzzleData } from '../models/PuzzleData';

@Component({
  selector: 'app-level-card',
  templateUrl: './level-card.component.html',
  styleUrls: ['./level-card.component.css']
})
export class LevelCardComponent {
  @Input() puzzle!: PuzzleData;
  @Input() showCreatorName: boolean = true;
  @Output() selected = new EventEmitter<PuzzleData>();

  onSelected(): void {
    this.selected.emit(this.puzzle);
  }
}

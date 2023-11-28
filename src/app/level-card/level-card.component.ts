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
  @Input() playerScore: number | null = null;
  @Output() selected = new EventEmitter<PuzzleData>();
  isCompleted: boolean = false;

  ngOnInit(): void {
    console.log('LevelCardComponent: Initialized');
    this.isCompleted = this.playerScore !== null;
    console.log('LevelCardComponent: isCompleted: ', this.isCompleted);
    console.log('LevelCardComponent: playerScore: ', this.playerScore);
  }

  onSelected(): void {
    this.selected.emit(this.puzzle);
  }
}

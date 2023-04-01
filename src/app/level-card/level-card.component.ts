import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-level-card',
  templateUrl: './level-card.component.html',
  styleUrls: ['./level-card.component.css']
})
export class LevelCardComponent {
  @Input() puzzle: any;
  @Output() selected = new EventEmitter<any>();

  onCardClick(): void {
    this.selected.emit(this.puzzle);
  }
}

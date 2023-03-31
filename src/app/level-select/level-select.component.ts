import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-level-select',
  templateUrl: './level-select.component.html',
  styleUrls: ['./level-select.component.css']
})
export class LevelSelectComponent implements OnInit {
  @Input() selectedPuzzleId: string = '';
  @Input() preSelectedPuzzleId: string = '';
  @Output() selectedPuzzleIdChange = new EventEmitter<string>();

  availablePuzzles: { id: string, name: string }[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    const puzzles = this.gameService.getSortedPuzzles();
    this.availablePuzzles = puzzles;
    if (puzzles.length > 0) {
      if (this.preSelectedPuzzleId) {
        this.selectedPuzzleId = this.preSelectedPuzzleId;
      } else {
        this.selectedPuzzleId = puzzles[0].id;
      }
    } else {
      this.selectedPuzzleId = this.preSelectedPuzzleId;
    }
  }

  onPuzzleSelectionChange(event: MatSelectChange): void {
    this.selectedPuzzleId = event.value;
    this.gameService.currentPuzzleId = this.selectedPuzzleId;
    this.selectedPuzzleIdChange.emit(this.selectedPuzzleId);
  }  
}

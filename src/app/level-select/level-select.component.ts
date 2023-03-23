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
  @Input() newestPuzzleId: string = '';
  @Output() selectedPuzzleIdChange = new EventEmitter<string>();

  availablePuzzles: { id: string, name: string }[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    const puzzles = this.gameService.getSortedPuzzles();
    this.availablePuzzles = puzzles;
    if (puzzles.length > 0) {
      this.selectedPuzzleId = puzzles[0].id; // Grab the most recent puzzle ID (sorted in descending order)
    } else {
      this.selectedPuzzleId = this.newestPuzzleId;
    }
  }

  onPuzzleSelectionChange(event: MatSelectChange): void {
    this.selectedPuzzleId = event.value;
    console.log(event);
    this.selectedPuzzleIdChange.emit(this.selectedPuzzleId);
  }  
}

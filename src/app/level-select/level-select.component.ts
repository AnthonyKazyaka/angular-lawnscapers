import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { PuzzleData } from '../models/PuzzleData';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-level-select',
  templateUrl: './level-select.component.html',
  styleUrls: ['./level-select.component.css'],
})
export class LevelSelectComponent implements OnInit {
  @Input() newestPuzzleId: string = '';
  @Input() selectedPuzzleId: string = '';
  @Output() startGame = new EventEmitter<{ puzzleId: string }>();
  puzzles: PuzzleData[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    // Get all puzzles sorted by ID
    this.puzzles = this.gameService.getSortedPuzzles();
    this.selectedPuzzleId = this.puzzles[0].id;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes["selectedPuzzleId"]) {
      this.selectedPuzzleId = changes["selectedPuzzleId"].currentValue;
    }
  }

  onPuzzleSelectionChange(event: any) {
    this.startGame.emit({ puzzleId: event.value });
  }
}
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { Puzzle } from '../models/Puzzle';
import { PuzzleData } from '../models/PuzzleData';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-level-select-screen',
  templateUrl: './level-select-screen.component.html',
  styleUrls: ['./level-select-screen.component.css']
})
export class LevelSelectScreenComponent implements OnInit {
  @Input() selectedPuzzleId: string = '';
  @Input() preSelectedPuzzleId: string = '';
  @Output() selectedPuzzleIdChange = new EventEmitter<string>();

  selectedTabIndex: number = 0;
  communityPuzzles: PuzzleData[] = [];
  officialPuzzles: PuzzleData[] = [];
  availablePuzzles: { id: string, name: string }[] = [];

  constructor(private gameService: GameService, private router: Router) {}

  ngOnInit(): void {
    const puzzles = this.gameService.getSortedPuzzles();
    this.officialPuzzles = puzzles;

  }

  onPuzzleSelectionChange(event: MatSelectChange): void {
    this.selectedPuzzleId = event.value;
    this.gameService.currentPuzzleId = this.selectedPuzzleId;
    this.selectedPuzzleIdChange.emit(this.selectedPuzzleId);
  }

  onLevelSelected(puzzle:PuzzleData): void {
    this.router.navigate(['/play', puzzle.id]);
  }

  goBackToMainMenu(): void {
    this.router.navigate(['/']);
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }
}

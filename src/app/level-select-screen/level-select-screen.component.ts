import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PuzzleData } from '../models/PuzzleData';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-level-select-screen',
  templateUrl: './level-select-screen.component.html',
  styleUrls: ['./level-select-screen.component.css']
})
export class LevelSelectScreenComponent implements OnInit {
  selectedTabIndex: number = 0;
  communityPuzzles: PuzzleData[] = [];
  officialPuzzles: PuzzleData[] = [];

  constructor(private gameService: GameService, private router: Router) {}

  ngOnInit(): void {
    const puzzles = this.gameService.getSortedPuzzles();
    this.officialPuzzles = puzzles;
  }

  onLevelSelected(puzzle:PuzzleData): void {
    this.router.navigate(['/play', puzzle.id]);
  }

  goBackToMainMenu(): void {
    this.router.navigate(['/']);
  }

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
  }
}

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HelpModalComponent } from '../help-modal/help-modal.component';
import { PuzzleData } from '../models/PuzzleData';
import { GameService } from '../services/game.service';
import { PuzzleService } from '../services/puzzle.service';

@Component({
  selector: 'app-level-select-screen',
  templateUrl: './level-select-screen.component.html',
  styleUrls: ['./level-select-screen.component.css']
})
export class LevelSelectScreenComponent implements OnInit {
  selectedTabIndex: number = 0;
  communityPuzzles: PuzzleData[] = [];
  officialPuzzles: PuzzleData[] = [];

  constructor(private gameService: GameService, private puzzleService: PuzzleService, private router: Router, private dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    this.officialPuzzles = await this.puzzleService.getOfficialPuzzlesData();
    this.communityPuzzles = await this.puzzleService.getCommunityPuzzlesData();
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

  openHelpModal(): void {
    this.dialog.open(HelpModalComponent);
  }
}

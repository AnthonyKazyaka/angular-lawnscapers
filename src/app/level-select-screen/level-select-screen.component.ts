import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { HelpModalComponent } from '../help-modal/help-modal.component';
import { PuzzleData } from '../models/PuzzleData';
import { PuzzleService } from '../services/puzzle.service';

interface PuzzleGroup {
  dimension: string;
  puzzles: PuzzleData[];
  isOpen: boolean;
  displayText: string;
}

@Component({
  selector: 'app-level-select-screen',
  templateUrl: './level-select-screen.component.html',
  styleUrls: ['./level-select-screen.component.css']
})
export class LevelSelectScreenComponent implements OnInit {
  selectedTabIndex: number = 0;
  communityPuzzles: PuzzleData[] = [];
  officialPuzzles: PuzzleData[] = [];
  officialPuzzleGroups: PuzzleGroup[] = [];
  communityPuzzleGroups: PuzzleGroup[] = [];

  constructor(private puzzleService: PuzzleService, private router: Router, private dialog: MatDialog) {}

  async ngOnInit(): Promise<void> {
    this.officialPuzzles = await this.puzzleService.getOfficialPuzzlesData();
    this.communityPuzzles = await this.puzzleService.getCommunityPuzzlesData();

    // Sort puzzles in ascending order by area (width * height) and number of obstacles
    this.officialPuzzles.sort((a, b) => (a.width * a.height + a.obstacles.length) - (b.width * b.height + b.obstacles.length));
    this.communityPuzzles.sort((a, b) => (a.width * a.height + a.obstacles.length) - (b.width * b.height + b.obstacles.length));
    
    this.officialPuzzleGroups = this.groupPuzzlesByDimensions(this.officialPuzzles);
    this.communityPuzzleGroups = this.groupPuzzlesByDimensions(this.communityPuzzles);
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

  toggleGroup(group: PuzzleGroup): void {
    group.isOpen = !group.isOpen;
  }

  private groupPuzzlesByDimensions(puzzles: PuzzleData[]): PuzzleGroup[] {
    const groups: { [key: string]: PuzzleData[] } = {};
    puzzles.forEach(puzzle => {
      const dimKey = `${puzzle.width}x${puzzle.height}`;
      if (!groups[dimKey]) {
        groups[dimKey] = [];
      }
      groups[dimKey].push(puzzle);
    });

    return Object.keys(groups).map(key => ({
      dimension: key,
      puzzles: groups[key],
      isOpen: true, // Initially all groups are open
      displayText: this.getGroupDisplayText(groups[key])
    }));
  }

  getGroupDisplayText(puzzles: PuzzleData[]): string {
    if (puzzles.length === 1) {
      return `${puzzles.length} puzzle`;
    } else {
      return `${puzzles.length} puzzles`;
    }
  }
}

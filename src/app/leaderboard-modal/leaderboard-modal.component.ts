import { Component, Inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from '../services/game.service';
import { ScoreEntry } from "../models/ScoreEntry";
import { GameState } from '../models/GameState';

@Component({
  selector: 'app-leaderboard-modal',
  templateUrl: './leaderboard-modal.component.html',
  styleUrls: ['./leaderboard-modal.component.css']
})
export class LeaderboardModalComponent implements OnInit {
  leaderboardEntries: ScoreEntry[] = [];
  puzzleScore: ScoreEntry | null = null;
  testScores: ScoreEntry[] | null = null;
  puzzleId: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<LeaderboardModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private gameService: GameService,
    private changeDetectorRef: ChangeDetectorRef
    ) {
      if (data.testScores) {
        this.testScores = data.testScores;
      } else {
        this.puzzleId = data.puzzleId;
        this.puzzleScore = data.puzzleScore;
      }
  }

  async ngOnInit(): Promise<void> {
    console.log("LeaderboardModalComponent: Initializing...");
    if (this.testScores && this.testScores.length > 0) {
      // Display test scores if available
      this.leaderboardEntries = [...this.testScores].sort((a, b) => a.score - b.score);
    }
    else if (this.puzzleId){
      try {
        // Always fetch the actual leaderboard entries from the database
        const rawLeaderboardEntries = await this.gameService.getLeaderboard(this.puzzleId);

        // Filter out entries with empty player names
        const filteredEntries = rawLeaderboardEntries.filter((entry) => entry && entry?.playerName?.trim() !== '' && this.hasPrintableCharacters(entry?.playerName));

        const groupedEntries: { [playerName: string]: ScoreEntry } = {};

        filteredEntries.forEach((entry) => {
          if (!groupedEntries[entry.playerName] || entry.score < groupedEntries[entry.playerName].score) {
            groupedEntries[entry.playerName] = entry;
          }
        });

        this.leaderboardEntries = Object.values(groupedEntries).sort((a, b) => a.score - b.score);
        console.log("LeaderboardModalComponent: Leaderboard Entries: ", this.leaderboardEntries);
        this.changeDetectorRef.detectChanges();
      } catch (error) {
        console.error('LeaderboardModalComponent: Failed to load leaderboard scores:', error);
      }
    }
    else {
      console.error("LeaderboardModalComponent: No test scores or puzzle ID provided");
    }
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  isPlayerScore(entry: ScoreEntry): boolean {
    return entry.playerName == this.puzzleScore?.playerName;
  }

  private hasPrintableCharacters(str: string): boolean {
    if (typeof str !== 'string') {
      return false;
    }
  
    const nonPrintableRegex = /^[\x20-\x7E]*$/;
    return nonPrintableRegex.test(str.trim());
  }
  
}

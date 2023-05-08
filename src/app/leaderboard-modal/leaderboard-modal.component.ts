import { Component, Inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GameService } from '../services/game.service';
import { ScoreEntry } from "../models/ScoreEntry";

@Component({
  selector: 'app-leaderboard-modal',
  templateUrl: './leaderboard-modal.component.html',
  styleUrls: ['./leaderboard-modal.component.css']
})
export class LeaderboardModalComponent implements OnInit {
  leaderboardEntries: ScoreEntry[] = [];
  puzzleScore: ScoreEntry | null = null;
  puzzleId: string;

  constructor(
    public dialogRef: MatDialogRef<LeaderboardModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private gameService: GameService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.puzzleId = data.puzzleId;
    this.puzzleScore = data.puzzleScore;
  }

  async ngOnInit(): Promise<void> {
    try {
      const rawLeaderboardEntries = await this.gameService.getLeaderboard(this.puzzleId);

      // Filter out entries with empty player names
      const filteredEntries = rawLeaderboardEntries.filter((entry) => entry.playerName.trim() !== '');

      const groupedEntries: { [playerName: string]: ScoreEntry } = {};

      filteredEntries.forEach((entry) => {
        if (!groupedEntries[entry.playerName] || entry.score < groupedEntries[entry.playerName].score) {
          groupedEntries[entry.playerName] = entry;
        }
      });

      this.leaderboardEntries = Object.values(groupedEntries).sort((a, b) => a.score - b.score);
      this.changeDetectorRef.detectChanges();
    } catch (error) {
      console.error('Failed to load leaderboard scores:', error);
    }
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  isPlayerScore(entry: ScoreEntry): boolean {
    return entry.playerName == this.puzzleScore?.playerName;
  }
}

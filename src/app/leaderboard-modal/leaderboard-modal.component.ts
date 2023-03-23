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
      this.leaderboardEntries = await this.gameService.getLeaderboard(this.puzzleId);
      this.changeDetectorRef.detectChanges();
    } catch (error) {
      console.error('Failed to load leaderboard scores:', error);
    }
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }

  isPlayerScore(entry: ScoreEntry): boolean {
    console.log("entry: ", entry.levelId_score_timestamp);
    console.log("puzzleScore: ", this.puzzleScore?.levelId_score_timestamp);
    return entry.levelId_score_timestamp == this.puzzleScore?.levelId_score_timestamp;
  }
}
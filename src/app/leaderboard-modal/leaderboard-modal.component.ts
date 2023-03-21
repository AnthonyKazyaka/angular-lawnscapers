import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DatabaseService } from '../database/database.service';
import { ScoreEntry } from "../models/ScoreEntry";

@Component({
  selector: 'app-leaderboard-modal',
  templateUrl: './leaderboard-modal.component.html',
  styleUrls: ['./leaderboard-modal.component.css']
})
export class LeaderboardModalComponent {
  leaderboard: Observable<ScoreEntry[]>;
  leaderboardEntries: ScoreEntry[] = [];

  constructor(
    public dialogRef: MatDialogRef<LeaderboardModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private databaseService: DatabaseService
  )
   {
    this.leaderboard = data.leaderboard;
  }

  ngOnInit(): void {
    this.databaseService
      .getLeaderboardScores(this.data.puzzleId)
      .then((scores) => {
        this.leaderboardEntries = scores.sort((a, b) => a.score - b.score);
      })
      .catch((error) => {
        console.error('Failed to load leaderboard scores:', error);
      });
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}

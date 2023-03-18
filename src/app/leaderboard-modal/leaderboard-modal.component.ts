import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ScoreEntry } from '../game.service';

@Component({
  selector: 'app-leaderboard-modal',
  templateUrl: './leaderboard-modal.component.html',
  styleUrls: ['./leaderboard-modal.component.css']
})
export class LeaderboardModalComponent {
  leaderboard: Observable<ScoreEntry[]>;

  constructor(
    public dialogRef: MatDialogRef<LeaderboardModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { leaderboard: Observable<ScoreEntry[]> }
  ) {
    this.leaderboard = data.leaderboard;
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}

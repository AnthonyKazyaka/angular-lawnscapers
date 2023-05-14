import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-player-name-dialog',
  templateUrl: './player-name-dialog.component.html',
})
export class PlayerNameDialogComponent {
  playerName: string = '';

  constructor(
    public dialogRef: MatDialogRef<PlayerNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  cancel(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    this.dialogRef.close(this.playerName);
  }
}

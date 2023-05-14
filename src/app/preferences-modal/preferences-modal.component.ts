import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup } from '@angular/forms';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-preferences-modal',
  templateUrl: './preferences-modal.component.html',
  styleUrls: ['./preferences-modal.component.css']
})
export class PreferencesModalComponent implements OnInit {
  preferenceForm: FormGroup = new FormGroup({});
  themes: string[] = ['Light']; //, 'Dark', 'Colorful'];

  constructor(
    public dialogRef: MatDialogRef<PreferencesModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private gameService: GameService
  ) {}

  ngOnInit(): void {
    this.preferenceForm = new FormGroup({
      playerName: new FormControl(this.gameService.playerName),
      theme: new FormControl(this.gameService.theme),
    });
  }

  onPreferenceChange(): void {
    const playerName = this.preferenceForm.get('playerName')?.value;

    if(playerName !== null && playerName !== undefined && playerName.length > 0) {
      this.gameService.playerName = playerName.value;
    }

    this.gameService.theme = this.preferenceForm.get('theme')!.value;
    localStorage.setItem('playerName', this.gameService.playerName);
    localStorage.setItem('theme', this.gameService.theme);
    this.dialogRef.close();
  }
}

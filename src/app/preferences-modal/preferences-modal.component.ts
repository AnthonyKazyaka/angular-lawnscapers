import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GameService } from '../services/game.service';
import { AbstractControl, ValidatorFn } from '@angular/forms';

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


  playerNameValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (value === 'New Player') {
        return { invalidPlayerName: true };
      }
      return null;
    };
  }

  ngOnInit(): void {
    this.preferenceForm = new FormGroup({
      playerName: new FormControl(this.gameService.playerName || 'New Player', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern('^[a-zA-Z0-9-_]+$'),
        this.playerNameValidator()
      ]),    
      theme: new FormControl(this.gameService.theme),
    });
  }

  onPreferenceChange(): void {
    const playerNameControl = this.preferenceForm.get('playerName');

    if (playerNameControl && playerNameControl.valid) {
      this.gameService.playerName = playerNameControl.value;
      localStorage.setItem('playerName', this.gameService.playerName);
    } else {
      // You may want to handle invalid player name scenario here
      console.error('Invalid player name');
    }

    const themeValue = this.preferenceForm.get('theme')!.value;
    this.gameService.theme = themeValue;
    localStorage.setItem('theme', themeValue);
    
    this.dialogRef.close();
  }
}

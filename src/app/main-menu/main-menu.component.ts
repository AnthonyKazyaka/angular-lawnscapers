import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { PlayerNameDialogComponent } from '../player-name-dialog/player-name-dialog.component';
import { PreferencesModalComponent } from '../preferences-modal/preferences-modal.component';
import { HelpModalComponent } from '../help-modal/help-modal.component';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {
  loading: boolean = true;
  playerName: string = '';
  selectedPuzzleId: string = '';
  preSelectedPuzzleId: string = '';

  private puzzlesLoadedSubscription: Subscription | null = null;

  constructor(private gameService: GameService, private router: Router, private dialog: MatDialog) {

  }

  ngOnInit(): void {
    this.gameService.initializeApp();

    this.puzzlesLoadedSubscription = this.gameService.puzzlesLoaded$.subscribe((loaded: boolean) => {
      if (loaded) {
        this.selectedPuzzleId = this.gameService.currentPuzzleId ? this.gameService.currentPuzzleId : this.gameService.newestPuzzleId;
      }
    });

    const savedPlayerName = localStorage.getItem('playerName');
    if (savedPlayerName) {
      this.playerName = savedPlayerName;
      this.gameService.playerName = savedPlayerName;
    }

    this.loading = false;
  }

  ngOnDestroy(): void {
    this.puzzlesLoadedSubscription?.unsubscribe();
  }

  navigateToLeaderboards(): void {
    if (!this.playerName) {
      this.openPlayerNameDialog();
      return;
    }
    this.router.navigate(['/leaderboards']);
  }

  onLevelSelectClick(): void {
    if (!this.playerName) {
      this.openPlayerNameDialog();
      return;
    }
    this.router.navigate(['/level-select']);
  }

  createPuzzle(): void {
    if (!this.playerName) {
      this.openPlayerNameDialog();
      return;
    }
    this.router.navigate(['/create']);
  }

  openPlayerNameDialog(): void {
    const dialogRef = this.dialog.open(PlayerNameDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      // name is required, so if the user closes the dialog without entering a name, don't do anything
      if (result) {
        this.playerName = result;
        this.gameService.playerName = result;
        localStorage.setItem('playerName', result);
      }
    });
  }

  openSettingsModal(): void {
    this.dialog.open(PreferencesModalComponent);
  }

  openHelpModal(): void {
    this.dialog.open(HelpModalComponent, {
      data: 'main-menu'
    });
  }

  openHowToPlayModal(): void {
    this.openHelpModal();
  }
}

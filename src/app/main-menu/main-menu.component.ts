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
      this.setPlayerName(savedPlayerName);
    }

    this.loading = false;
  }

  ngOnDestroy(): void {
    this.puzzlesLoadedSubscription?.unsubscribe();
  }

  navigateToLeaderboards(): void {
    this.validatePlayerAndNavigate('/leaderboards');
  }

  onLevelSelectClick(): void {
    this.validatePlayerAndNavigate('/level-select');
  }

  createPuzzle(): void {
    this.validatePlayerAndNavigate('/create');
  }

  openPlayerNameDialog(): void {
    const dialogRef = this.dialog.open(PlayerNameDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      // name is required, so if the user closes the dialog without entering a name, don't do anything
      if (result) {
        this.setPlayerName(result);
      }
    });
  }

  setPlayerName(name: string): void {
    this.gameService.playerName = name;
    localStorage.setItem('playerName', name);
    this.gameService.fetchAndStorePlayerScores();
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

  isPlayerNameSet(): boolean {
    return this.gameService.playerName !== '';
  }

  validatePlayerAndNavigate(route: string): void {
    if (!this.isPlayerNameSet()) {
      this.openPlayerNameDialog();
      return;
    }
    this.router.navigate([route]);
  }
}

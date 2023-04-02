import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { GameState } from "../models/GameState";
import { HowToPlayModalComponent } from '../how-to-play-modal/how-to-play-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { LevelSelectScreenComponent } from '../level-select-screen/level-select-screen.component';

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
    if (this.gameService.getSortedPuzzles().length === 0) {
      this.gameService.initializeApp();
    }
  
    this.puzzlesLoadedSubscription = this.gameService.puzzlesLoaded$.subscribe((loaded: boolean) => {
      if (loaded) {
        this.selectedPuzzleId = this.gameService.currentPuzzleId ? this.gameService.currentPuzzleId : this.gameService.newestPuzzleId;
      }
    });

    this.selectedPuzzleId = this.gameService.currentPuzzleId ? this.gameService.currentPuzzleId : this.gameService.newestPuzzleId;

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

  startGame(playerName: string, puzzleId: string): void {
    console.log("puzzleId", puzzleId)
    this.gameService.playerName = playerName;
    this.gameService.currentPuzzleId = puzzleId;
    this.router.navigate(['/play', puzzleId]);
  }

  onSelectedPuzzleIdChange(puzzleId: string): void {
    this.selectedPuzzleId = puzzleId;
    this.gameService.currentPuzzleId = puzzleId;
    this.gameService.playerName = this.playerName;
  }

  createPuzzle(): void {
    this.router.navigate(['/create']);
  }

  openHowToPlayModal(): void {
    this.dialog.open(HowToPlayModalComponent);
  }

  openLevelSelectScreen(): void {

  }

  onPlayerNameBlur(): void {
    localStorage.setItem('playerName', this.playerName);
    this.gameService.playerName = this.playerName;
  }

  onLevelSelectClick(): void {
    
    this.router.navigate(['/level-select']);
  }

}

import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { GameState } from "../models/GameState";

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

  constructor(private gameService: GameService, private router: Router) {

  }

  ngOnInit(): void {
    this.loading = false;

    if (this.gameService.getSortedPuzzles().length === 0) {
      this.gameService.loadPuzzlesData();
    }

    this.selectedPuzzleId = this.gameService.currentPuzzleId ? this.gameService.currentPuzzleId : this.gameService.newestPuzzleId;

    const savedPlayerName = localStorage.getItem('playerName');
    if (savedPlayerName) {
      this.playerName = savedPlayerName;
      this.gameService.playerName = savedPlayerName;
    }
  }

  startGame(playerName: string, puzzleId: string): void {
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
}

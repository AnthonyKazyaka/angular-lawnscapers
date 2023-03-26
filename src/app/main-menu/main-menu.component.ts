import { Component, EventEmitter, OnInit, Output } from '@angular/core';
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

  constructor(private gameService: GameService) {

  }

  ngOnInit(): void {
    this.loading = false;

    if (this.gameService.getSortedPuzzles().length === 0) {
      this.gameService.loadPuzzlesData();

      this.preSelectedPuzzleId = this.gameService.newestPuzzleId;
      this.selectedPuzzleId = this.preSelectedPuzzleId;
    }

    const savedPlayerName = localStorage.getItem('playerName');
      if (savedPlayerName) {
        this.playerName = savedPlayerName;
        this.gameService.playerName = savedPlayerName;
      }
  }

  startGame(playerName: string, puzzleId: string): void {
    this.gameService.playerName = playerName;
    this.gameService.initializePuzzle(puzzleId);
    this.gameService.setGameState(GameState.Playing);
  }

  onSelectedPuzzleIdChange(puzzleId: string): void {
    this.selectedPuzzleId = puzzleId;
    this.gameService.playerName = this.playerName;
  }

  createPuzzle(): void {
    this.gameService.playerName = this.playerName;
    this.gameService.setGameState(GameState.CreatingPuzzle);
  }
}

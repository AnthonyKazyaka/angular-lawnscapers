import { Component, OnInit } from '@angular/core';
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
    this.preSelectedPuzzleId = this.gameService.newestPuzzleId;
    this.selectedPuzzleId = this.preSelectedPuzzleId;
  }  

  startGame(playerName: string, puzzleId: string): void {
    this.gameService.playerName = playerName;
    this.gameService.initializePuzzle(puzzleId);
    this.gameService.gameState = GameState.Playing;
  }

  onSelectedPuzzleIdChange(puzzleId: string): void {
    this.selectedPuzzleId = puzzleId;
  }  
}

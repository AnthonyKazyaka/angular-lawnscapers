import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { GameService } from '../services/game.service';
import { ScoreEntry } from "../models/ScoreEntry";
import { Player } from "../models/Player";
import { MatDialog } from '@angular/material/dialog';
import { LeaderboardModalComponent } from '../leaderboard-modal/leaderboard-modal.component';
import { Direction } from '../direction/Direction';
import { GameState } from '../models/GameState';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  GameState = GameState;
  playerName: string = '';
  newestPuzzleId: string = '';
  selectedPuzzleId: string = '';
  leaderboard: ScoreEntry[] = [];
  player: Player = this.gameService.player ?? new Player({ x: 0, y: 0 });
  boardDisplay: string[][] = [];
  moveCount: number = 0;
  puzzleScore: ScoreEntry | null = null;
  loading: boolean = true;

  constructor(public gameService: GameService, private dialog: MatDialog, private changeDetector: ChangeDetectorRef) { }

  get puzzle() {
    return this.gameService.puzzle;
  }

  async ngOnInit(): Promise<void> {
    //await this.gameService.initializeApp();
    this.newestPuzzleId = this.gameService.newestPuzzleId;
    this.selectedPuzzleId = this.newestPuzzleId;
    const savedPlayerName = localStorage.getItem('playerName');
    if (savedPlayerName) {
      this.playerName = savedPlayerName;
    }
    this.loading = false;
  }

  onMovePlayer(direction: Direction): void {
    if (this.gameService.puzzle && this.gameService.canMovePlayer(direction) && !(this.gameService.gameState == GameState.Completed)) {
      console.log("Can Move Player")
      this.gameService.puzzle.movePlayerUntilStopped(direction);
      this.moveCount++;
      this.boardDisplay = this.puzzle.getDisplayBoard();
      this.changeDetector.detectChanges(); // Manually trigger change detection
      if (this.gameService.puzzle.isComplete) {
        setTimeout(() => {
          this.handleGameCompletion();
        }, 100);
      }
    }
  }

  startGame(playerName: string, puzzleId: string): void {
    if (puzzleId === 'default') {
      console.warn('Default puzzle is not allowed.');
      return;
    }
    this.playerName = playerName;
    localStorage.setItem('playerName', playerName);

    this.setGameState(GameState.Playing);
    this.moveCount = 0;

    this.gameService.initializePuzzle(puzzleId).then(() => {
      // Use the player instance from GameService
      this.player = this.gameService.player;
      if (!this.player) {
        console.error('Player not initialized');
      }

      this.boardDisplay = this.puzzle.getDisplayBoard();
      this.changeDetector.detectChanges();
    }).catch(error => {
      console.error(error);
    });
  }

  setGameState(newState: GameState): void {
    this.gameService.gameState = newState;
    this.changeDetector.detectChanges(); // Manually trigger change detection
  }  

  restartGame(): void {
    if (this.gameService.puzzle) {
      this.startGame(this.playerName, this.gameService.puzzle.id);
    }
  }

  completeGame() {
    this.setGameState(GameState.Completed);
  }
  
  returnToMainMenu(): void {
    console.log("Returning to Main Menu");
    this.setGameState(GameState.MainMenu);
    this.selectedPuzzleId = this.gameService.newestPuzzleId;
  }  
  
  async handleGameCompletion(): Promise<void> {
    if (this.gameService.puzzle) {
      this.gameService.gameState = GameState.Completed;
      await this.submitScore();
      if (this.gameService.puzzle !== null) {
        this.leaderboard = await this.gameService.getLeaderboard(this.gameService.puzzle.id);
      }
      this.openLeaderboardModal();
    }
  }

  async submitScore(): Promise<void> {
    if (this.gameService.puzzle !== null) {
      this.puzzleScore = await this.gameService.saveScore(
        this.playerName,
        this.moveCount,
        this.gameService.puzzle.id
      );
      if (this.gameService.puzzle !== null) {
        this.leaderboard = await this.gameService.getLeaderboard(
          this.gameService.puzzle.id
        );
      }
    }
  }

  async promptRestart(): Promise<void> {
    if (this.gameService.gameState == GameState.Completed || confirm('Are you sure you want to restart the game?')) {
      this.restartGame();
    }
  }

  openLeaderboardModal(): void {
    if(this.gameService.puzzle !== null) {
      this.dialog.open(LeaderboardModalComponent, {
        data: {
          puzzleId: this.gameService.puzzle.id,
          puzzleScore: this.puzzleScore
        }
      });
    }
  }
}
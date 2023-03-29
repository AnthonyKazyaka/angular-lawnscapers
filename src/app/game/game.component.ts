import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { GameService } from '../services/game.service';
import { ScoreEntry } from "../models/ScoreEntry";
import { Player } from "../models/Player";
import { MatDialog } from '@angular/material/dialog';
import { LeaderboardModalComponent } from '../leaderboard-modal/leaderboard-modal.component';
import { Direction } from '../direction/Direction';
import { GameState } from '../models/GameState';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HelpModalComponent } from '../help-modal/help-modal.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  GameState = GameState;
  newestPuzzleId: string = '';
  selectedPuzzleId: string = '';
  leaderboard: ScoreEntry[] = [];
  player: Player = this.gameService.player ?? new Player({ x: 0, y: 0 });
  boardDisplay: string[][] = [];
  moveCount: number = 0;
  puzzleScore: ScoreEntry | null = null;
  loading: boolean = true;
  puzzleCompleted: boolean = false;
  subscription: Subscription = new Subscription;

  constructor(public gameService: GameService, private dialog: MatDialog, private changeDetector: ChangeDetectorRef, private router: Router, private route: ActivatedRoute) { }

  get puzzle() {
    return this.gameService.puzzle;
  }

  async ngOnInit(): Promise<void> {
    this.route.paramMap.subscribe((params) => {
      const puzzleId = params.get('puzzleId');
      if (puzzleId) {
        this.selectedPuzzleId = puzzleId;
        this.gameService.currentPuzzleId = puzzleId;
      }
    });
    this.logCurrentGameState();
    console.log('Game component initialized');
    this.newestPuzzleId = this.gameService.newestPuzzleId;
    this.loading = false;

    this.gameService.puzzleCompletedEvent.subscribe((completed: boolean) => {
      this.puzzleCompleted = completed;
      console.log('Puzzle completed status:', completed);
    });

    this.subscription = this.gameService.gameState$.subscribe((newState: GameState) => {
      if (newState === GameState.TestingPuzzle || newState === GameState.Playing) {
        this.boardDisplay = this.gameService.getDisplayBoard();
        console.log('Puzzle board updated:', this.boardDisplay);
      }
    });

    this.gameService.puzzleTestCompletedEvent.subscribe((completed: boolean) => {
      if (completed) {
        this.gameService.setGameState(GameState.CreatingPuzzle);
        this.boardDisplay = this.gameService.getDisplayBoard(); // Update the board display
        this.changeDetector.detectChanges(); // Manually trigger change detection
      }
    });
  }

  logCurrentGameState(): void {
    console.log('Current game state:', GameState[this.gameService.gameState]);
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
    this.gameService.playerName = playerName;
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
    this.gameService.setGameState(newState);
    this.logCurrentGameState();
    this.changeDetector.detectChanges(); // Manually trigger change detection
  }

  restartGame(): void {
    if (this.gameService.puzzle) {
      this.startGame(this.gameService.playerName, this.gameService.puzzle.id);
    }
  }

  completeGame() {
    this.gameService.setPuzzleCompleted(true);
  }

  returnToMainMenu(): void {
    console.log("Returning to Main Menu");
    this.router.navigate(['/']);
    this.setGameState(GameState.MainMenu);
    this.selectedPuzzleId = this.gameService.newestPuzzleId;
  }

  goBackToPuzzleCreation(): void {
    this.gameService.setGameState(GameState.CreatingPuzzle);
    this.boardDisplay = this.gameService.getDisplayBoard(); // Update the board display
    this.changeDetector.detectChanges(); // Manually trigger change detection
    this.router.navigate(['/create']);
  }

  openHelpModal(): void {
    this.dialog.open(HelpModalComponent, {
      data: this.gameService.gameState === GameState.TestingPuzzle ? 'testing' : 'playing'
    });
  }

  async handleGameCompletion(): Promise<void> {
    if (this.gameService.puzzle) {
      if(this.gameService.gameState == GameState.TestingPuzzle){
        this.gameService.setGameState(GameState.CreatingPuzzle);
        this.gameService.setPuzzleTestCompleted(true);
        console.log("Puzzle board:", this.gameService.puzzle.getDisplayBoard());
      }
      else{
        this.setGameState(GameState.Completed);
        await this.submitScore();

        if (this.gameService.puzzle !== null) {
          this.leaderboard = await this.gameService.getLeaderboard(this.gameService.puzzle.id);
        }
  
        this.openLeaderboardModal();
      }
    }
  }

  async submitScore(): Promise<void> {
    if (this.gameService.puzzle !== null) {
      this.puzzleScore = await this.gameService.saveScore(
        this.gameService.playerName,
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
    this.logCurrentGameState();
    if (this.gameService.puzzle !== null && !this.gameService.isPuzzleBeingTested) {
      this.dialog.open(LeaderboardModalComponent, {
        data: {
          puzzleId: this.gameService.puzzle.id,
          puzzleScore: this.puzzleScore
        }
      });
    }
  }
}
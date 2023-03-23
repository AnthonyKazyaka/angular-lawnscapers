import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { GameService } from '../services/game.service';
import { ScoreEntry } from "../models/ScoreEntry";
import { Player } from "../models/Player";
import { MatDialog } from '@angular/material/dialog';
import { LeaderboardModalComponent } from '../leaderboard-modal/leaderboard-modal.component';
import { Direction } from '../direction/Direction';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit {
  playerName: string = '';
  newestPuzzleId: string = '';
  gameStarted: boolean = false;
  gameCompleted: boolean = false;
  leaderboard: ScoreEntry[] = [];
  player: Player = this.gameService.player ?? new Player({ x: 0, y: 0 });
  boardDisplay: string[][] = [];
  moveCount: number = 0;
  puzzleScore: ScoreEntry | null = null;

  constructor(private gameService: GameService, private dialog: MatDialog, private changeDetector: ChangeDetectorRef) { }

  get puzzle() {
    return this.gameService.puzzle;
  }

  ngOnInit(): void {
    this.newestPuzzleId = this.gameService.newestPuzzleId;
    const savedPlayerName = localStorage.getItem('playerName');
    if (savedPlayerName) {
      this.playerName = savedPlayerName;
    }
  }

  onMovePlayer(direction: Direction): void {
    if (this.gameService.puzzle && !this.gameCompleted) {
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
    this.playerName = playerName;
    localStorage.setItem('playerName', playerName);

    this.gameStarted = true;
    this.gameCompleted = false;
    this.moveCount = 0;

    this.gameService.initializePuzzle(puzzleId).then(() => {
      this.gameStarted = true;

      // Use the player instance from GameService
      this.player = this.gameService.player;
      if (!this.player) {
        console.error('Player not initialized');
      }
    }).catch(error => {
      console.error(error);
    });
  }

  restartGame(): void {
    if (this.gameService.puzzle) {
      this.startGame(this.playerName, this.gameService.puzzle.id);
    }
  }

  completeGame() {
    this.gameCompleted = true;
  }

  async handleGameCompletion(): Promise<void> {
    if (this.gameService.puzzle) {
      console.log('Puzzle ID in handleGameCompletion:', this.gameService.puzzle.id);
      this.gameCompleted = true;
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
    if (this.gameCompleted || confirm('Are you sure you want to restart the game?')) {
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
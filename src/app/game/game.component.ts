import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { GameService } from '../services/game.service';
import { ScoreEntry } from "../models/ScoreEntry";
import { Player } from "../models/Player";
import { Observable, EMPTY } from 'rxjs';
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
  gameStarted: boolean = false;
  gameCompleted: boolean = false;
  leaderboard: ScoreEntry[] = [];
  player: Player = this.gameService.player ?? new Player({ x: 0, y: 0 });
  boardDisplay: string[][] = [];

  constructor(private gameService: GameService, private dialog: MatDialog, private changeDetector: ChangeDetectorRef) { }

  get puzzle() {
    return this.gameService.puzzle;
  }

  getNewestPuzzleId(): string {
    return this.gameService.newestPuzzleId;
  }

  ngOnInit(): void {
    this.gameService.initializePuzzle(this.getNewestPuzzleId()).then(() => {
      if (this.gameService.puzzle !== null) {
        this.gameService.puzzle.addObstacle({ x: 1, y: 1 });
        this.gameService.puzzle.addObstacle({ x: 4, y: 4 });
        this.gameService.puzzle.addObstacle({ x: 3, y: 0 });
        this.gameService.puzzle.addObstacle({ x: 0, y: 3 });
      }
    }).catch(error => {
      console.error(error);
    });
  }

  onMovePlayer(direction: Direction): void {
    if (this.gameService.puzzle) {
      console.log("onMovePlayer")
      this.gameService.puzzle.movePlayerUntilStopped(direction);
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
    this.gameStarted = true;
    this.gameCompleted = false;

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
      await this.gameService.saveScore(this.playerName, this.gameService.puzzle.moveCount, this.gameService.puzzle.id);
      if (this.gameService.puzzle !== null) {
        this.leaderboard = await this.gameService.getLeaderboard(this.gameService.puzzle.id);
      }
      this.openLeaderboardModal();
    }
  }

  async submitScore(): Promise<void> {
    if (this.gameService.puzzle !== null) {
      await this.gameService.saveScore(
        this.playerName,
        this.gameService.puzzle.moveCount,
        this.gameService.puzzle.id
      );
      if (this.gameService.puzzle !== null) {
        this.leaderboard = await this.gameService.getLeaderboard(
          this.gameService.puzzle.id
        );
      }
    }
  }
  
  openLeaderboardModal(): void {
    if(this.gameService.puzzle !== null) {
      this.dialog.open(LeaderboardModalComponent, {
        data: {
          puzzleId: this.gameService.puzzle.id
        }
      });
    }
  }
}
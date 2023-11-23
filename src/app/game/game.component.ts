import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { GameService } from '../services/game.service';
import { MatDialog } from '@angular/material/dialog';
import { LeaderboardModalComponent } from '../leaderboard-modal/leaderboard-modal.component';
import { Direction } from '../models/Direction';
import { GameState } from '../models/GameState';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HelpModalComponent } from '../help-modal/help-modal.component';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  GameState = GameState;
  selectedPuzzleId: string = '';
  boardDisplay: string[][] = [];
  loading: boolean = true;
  private isLeaderboardModalOpen: boolean = false;
  private puzzleCompletedSubscription: Subscription = new Subscription();
  private gameStateSubscription: Subscription = new Subscription();

  constructor(
    public gameService: GameService, 
    private dialog: MatDialog, 
    private changeDetector: ChangeDetectorRef, 
    private router: Router, 
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('GameComponent: Initialized');
    this.initializePlayer();
    this.handleRouteParams();
    this.subscribeToGameEvents();
  }

  ngOnDestroy(): void {
    console.log('GameComponent: Destroyed');
    this.unsubscribeAll();
  }

  private initializePlayer(): void {
    console.log('GameComponent: Initializing Player');
    const savedPlayerName = localStorage.getItem('playerName');
    if (!this.gameService.playerName && savedPlayerName) {
      this.gameService.playerName = savedPlayerName;
    }
  }

  private handleRouteParams(): void {
    console.log('GameComponent: Handling Route Parameters');
    this.route.paramMap.subscribe(params => {
      const puzzleId = params.get('puzzleId');
      console.log(`GameComponent: Puzzle ID from route: ${puzzleId}`);
      if (puzzleId) {
        this.startGame(this.gameService.playerName, puzzleId);
      }
    });
  }

  private subscribeToGameEvents(): void {


    console.log('GameComponent: Subscribing to Game Events');
    this.puzzleCompletedSubscription.add(
      this.gameService.puzzleCompletedEvent$.subscribe(completed => {
        console.log(`GameComponent: Puzzle Completed: ${completed}`);
        if (completed) this.handleGameCompletion();
      })
    );

    this.gameStateSubscription.add(
      this.gameService.gameState$.subscribe(newState => {
        console.log(`GameComponent: Game State Changed: ${newState}`);
        this.handleGameStateChange(newState);
      })
    );
  }

  private handleGameStateChange(newState: GameState): void {
    console.log(`GameComponent: Handling Game State Change: ${newState}`);
    if ([GameState.TestingPuzzle, GameState.Playing].includes(newState)) {
      this.boardDisplay = this.gameService.getDisplayBoard();
      this.changeDetector.detectChanges();
    }
    console.log(`GameComponent: Game State: ${this.gameService.gameState}`);
    //console.log(`GameComponent: Subscriptions: ${JSON.stringify(this.subscriptions)}`)
  }

  private unsubscribeAll(): void {
    console.log('GameComponent: Unsubscribing from all Subscriptions');
    this.puzzleCompletedSubscription.unsubscribe();
    this.gameStateSubscription.unsubscribe();
  }

  onMovePlayer(direction: Direction): void {
    if (this.gameService.puzzle && this.gameService.player && this.gameService.canMovePlayer(direction) && !(this.gameService.gameState == GameState.Completed)) {
      console.log(`GameComponent: Player Move: ${direction}`);
      this.gameService.movePlayer(direction);
      this.boardDisplay = this.gameService.puzzle.getDisplayBoard();
      this.changeDetector.detectChanges();
    }
  }

  startGame(playerName: string, puzzleId: string): void {
    console.log(`GameComponent: Starting Game: ${puzzleId}`);
    this.loading = false;
    if (puzzleId === 'default') {
      console.warn('GameComponent: Default puzzle is not allowed.');
      return;
    }
    
    this.gameService.playerName = playerName;
    localStorage.setItem('playerName', playerName);
    
    this.setGameState(GameState.Playing);
    this.gameService.startNewPuzzle(puzzleId);
  }

  setGameState(newState: GameState): void {
    console.log(`GameComponent: Setting Game State: ${newState}`);
    this.gameService.setGameState(newState);
    this.changeDetector.detectChanges();
  }

  restartGame(): void {
    console.log('GameComponent: Restarting Game');
    if (this.gameService.puzzle) {
      this.startGame(this.gameService.playerName, this.gameService.puzzle.id);
    }
  }

  returnToLevelSelect(): void {
    console.log('GameComponent: Returning to Level Select');
    this.gameService.setGameState(GameState.SelectingLevel);
    this.router.navigate(['/level-select']);
  }

  goBackToPuzzleCreation(): void {
    console.log('GameComponent: Going Back to Puzzle Creation');
    this.gameService.setGameState(GameState.CreatingPuzzle);
    this.boardDisplay = this.gameService.getDisplayBoard();
    this.changeDetector.detectChanges();
    this.router.navigate(['/create']);
  }
  
  goBack(): void {
    console.log('GameComponent: Going Back');
    if(this.gameService.gameState == GameState.TestingPuzzle) {
      this.goBackToPuzzleCreation();
    }
    else {
      this.returnToLevelSelect();
    }
  }

  openHelpModal(): void {
    console.log('GameComponent: Opening Help Modal');
    this.dialog.open(HelpModalComponent, {
      data: this.gameService.gameState === GameState.TestingPuzzle ? 'testing' : 'playing'
    });
  }

  private handleGameCompletion(): void {
    console.log('GameComponent: Handling Game Completion');
    if (!this.isLeaderboardModalOpen) {
      this.openLeaderboardModal();
    }
  }

  async promptRestart(): Promise<void> {
    console.log('GameComponent: Prompting Restart');
    if (this.gameService.gameState == GameState.Completed || confirm('Are you sure you want to restart the game?')) {
      this.restartGame();
    }
  }

  private openLeaderboardModal(): void {
    console.log('GameComponent: Attempting to open Leaderboard Modal');
    if (!this.isLeaderboardModalOpen) {
        console.log('GameComponent: Leaderboard modal is not open, proceeding to open');
    } else {
        console.log('GameComponent: Leaderboard modal is already open');
    }
    
    if (this.gameService.puzzle && this.gameService.gameState === GameState.Completed) {
      this.isLeaderboardModalOpen = true;
      const modalRef = this.dialog.open(LeaderboardModalComponent, {
        data: {
          puzzleId: this.gameService.puzzle.id,
          puzzleScore: this.gameService.puzzleScore
        }
      });

      modalRef.afterClosed().subscribe(() => {
        console.log('GameComponent: Leaderboard Modal Closed');
        this.isLeaderboardModalOpen = false;
      });
    }
  }
}

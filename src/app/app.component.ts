import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialog } from '@angular/material/dialog';
import { LeaderboardModalComponent } from './leaderboard-modal/leaderboard-modal.component';
import { GameService } from './services/game.service';
import { GameState } from "./models/GameState";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  GameState = GameState;
  constructor(public gameService: GameService, private angularFirebaseAuth: AngularFireAuth) {}

  ngOnInit() {
    this.angularFirebaseAuth.signInAnonymously().catch((error) => {
      console.error('Error signing in anonymously:', error);
    });
  }

  signInAnonymously() {
    this.angularFirebaseAuth.signInAnonymously()
      .catch((error) => {
        console.error('Error signing in anonymously:', error);
      });
  }
}

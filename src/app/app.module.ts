import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER  } from '@angular/core';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

import { GameService } from './services/game.service';
import { LeaderboardModalComponent } from './leaderboard-modal/leaderboard-modal.component';
import { GameComponent } from './game/game.component';
import { environment } from '../environments/environment';
import { SwipeDirective } from './swipe/swipe.directive';
import { LevelSelectComponent } from './level-select/level-select.component';
import { PuzzleBoardComponent } from './puzzle-board/puzzle-board.component';
import { CreatePuzzleComponent } from './create-puzzle/create-puzzle.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { AppRoutingModule } from './app-routing.module';
import { HowToPlayModalComponent } from './how-to-play-modal/how-to-play-modal.component';
import { HelpModalComponent } from './help-modal/help-modal.component';

export function initializeApp(gameService: GameService) {
  return () => gameService.initializeApp();
}

@NgModule({
  declarations: [AppComponent, LeaderboardModalComponent, GameComponent, SwipeDirective, LevelSelectComponent, PuzzleBoardComponent, CreatePuzzleComponent, MainMenuComponent, HowToPlayModalComponent, HelpModalComponent],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AppRoutingModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      deps: [GameService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

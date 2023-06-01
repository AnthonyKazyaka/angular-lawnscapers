import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { CreatePuzzleComponent } from './create-puzzle/create-puzzle.component';
import { GameComponent } from './game/game.component';
import { LevelSelectScreenComponent } from './level-select-screen/level-select-screen.component';
import { LeaderboardsComponent } from './leaderboards/leaderboards.component';

const routes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'create', component: CreatePuzzleComponent },
  { path: 'play/:puzzleId', component: GameComponent },
  { path: 'testing', component: GameComponent },
  { path: 'level-select', component: LevelSelectScreenComponent },
  { path: 'leaderboards', component: LeaderboardsComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
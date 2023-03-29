import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { CreatePuzzleComponent } from './create-puzzle/create-puzzle.component';
import { GameComponent } from './game/game.component';

const routes: Routes = [
  { path: '', component: MainMenuComponent },
  { path: 'create', component: CreatePuzzleComponent },
  { path: 'play/:puzzleId', component: GameComponent },
  { path: 'testing', component: GameComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }

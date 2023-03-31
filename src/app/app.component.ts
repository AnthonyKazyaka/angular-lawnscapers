import { Component, OnInit } from '@angular/core';
import { GameService } from './services/game.service';
import { GameState } from "./models/GameState";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  GameState = GameState;
  constructor(public gameService: GameService) {}

  ngOnInit(): void {
    
  }
}

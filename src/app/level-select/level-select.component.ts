import { Component, EventEmitter, Output } from '@angular/core';
import { GameService } from '../services/game.service';

@Component({
  selector: 'app-level-select',
  templateUrl: './level-select.component.html',
  styleUrls: ['./level-select.component.css']
})
export class LevelSelectComponent {
  @Output() startGame = new EventEmitter<{ playerName: string; puzzleId: string }>();

  constructor(public gameService: GameService) { }
}

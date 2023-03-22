import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Direction } from '../direction/Direction';

@Component({
  selector: 'app-puzzle-board',
  templateUrl: './puzzle-board.component.html',
  styleUrls: ['./puzzle-board.component.css']
})
export class PuzzleBoardComponent implements OnInit {
  @Input() boardDisplay: string[][] = [];
  @Output() swipe = new EventEmitter<Direction>();

  constructor() { }

  ngOnInit(): void {
  }

  onSwipe(direction: Direction): void {
    this.swipe.emit(direction);
  }  
}

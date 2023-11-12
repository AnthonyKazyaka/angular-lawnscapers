import { Direction } from "./Direction";

export class Player {
  position: { x: number; y: number; };
  direction: Direction = Direction.Right;

  constructor(startPosition: { x: number; y: number; }, direction: Direction = Direction.Right) {
    this.position = startPosition;
    this.direction = direction;
  }

  getPlayerClass(direction: Direction|null): string {
    switch (direction) {
      case Direction.Up: return 'player-up';
      case Direction.Down: return 'player-down';
      case Direction.Left: return 'player-left';
      case Direction.Right: return 'player-right';
      default: return '';
    }
  }  
}

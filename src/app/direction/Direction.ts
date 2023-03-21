
export enum Direction { Up, Down, Left, Right }

export function getDirectionOffset(direction: Direction): { x: number; y: number; } {
    switch (direction) {
      case Direction.Up:
        return { x: 0, y: -1 };
      case Direction.Down:
        return { x: 0, y: 1 };
      case Direction.Left:
        return { x: -1, y: 0 };
      case Direction.Right:
        return { x: 1, y: 0 };
      default:
        return { x: 0, y: 0 };
    }
  }
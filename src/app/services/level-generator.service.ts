import { Injectable } from '@angular/core';
import { Direction, getDirectionOffset } from '../models/Direction';
import { Puzzle } from '../models/Puzzle';
import { PuzzleData } from '../models/PuzzleData';
import { GameService } from './game.service';

type State = {
  position: { x: number; y: number };
  moves: number;
};

@Injectable({
  providedIn: 'root'
})
export class LevelGeneratorService {

  constructor(public gameService: GameService) { }

  generateRandomLevel(minWidth: number, maxWidth: number, minHeight: number, maxHeight: number): PuzzleData {
    let puzzleData: PuzzleData;
    const attempts = 1;

    do {
      const width = Math.floor(Math.random() * (maxWidth - minWidth + 1)) + minWidth;
      const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
      const playerStartPosition = {
        x: Math.floor(Math.random() * width),
        y: Math.floor(Math.random() * height),
      };
      const obstacles: { x: number; y: number; }[] = [];

      for (let i = 0; i < Math.floor((width * height) * 0.25); i++) {
        const obstacle = {
          x: Math.floor(Math.random() * width),
          y: Math.floor(Math.random() * height),
        };

        if (!obstacles.some(o => o.x === obstacle.x && o.y === obstacle.y) &&
          (obstacle.x !== playerStartPosition.x || obstacle.y !== playerStartPosition.y)) {
          obstacles.push(obstacle);
        }
      }

      var currentDate = new Date();

      puzzleData = {
        id: `generated-level-${this.gameService.playerName}-${currentDate.getTime()}`,
        name: 'Generated Level',
        creator: 'Level Generator',
        width,
        height,
        playerStartPosition,
        obstacles,
        created_at: new Date().toISOString(),
      };

      console.log("Attempt: ", attempts, "Puzzle Data: ", puzzleData);
    } while (!this.isLevelCompletable(new Puzzle(puzzleData)));

    return puzzleData;
  }

  isLevelCompletable(puzzle: Puzzle): boolean {
    const visited = new Array(puzzle.height).fill(false).map(() => new Array(puzzle.width).fill(false));
    const stack = [puzzle.player.position];

    while (stack.length) {
      const { x, y } = stack.pop() as { x: number; y: number; };

      if (visited[y][x]) {
        continue;
      }

      visited[y][x] = true;
      const neighbors = [
        { x: x + 1, y },
        { x: x - 1, y },
        { x, y: y + 1 },
        { x, y: y - 1 },
      ];

      for (const neighbor of neighbors) {
        if (neighbor.x >= 0 && neighbor.x < puzzle.width &&
          neighbor.y >= 0 && neighbor.y < puzzle.height &&
          puzzle.puzzleBoard[neighbor.y][neighbor.x].isOccupiable &&
          !visited[neighbor.y][neighbor.x]) {
          stack.push(neighbor);
        }
      }
    }

    for (let y = 0; y < puzzle.height; y++) {
      for (let x = 0; x < puzzle.width; x++) {
        if (puzzle.puzzleBoard[y][x].isOccupiable && !visited[y][x]) {
          return false;
        }
      }
    }

    return true;
  }

  calculateMinimumMoves(puzzleData: PuzzleData): number {
    const visited: boolean[][] = Array.from({ length: puzzleData.height }, () => Array(puzzleData.width).fill(false));
    const queue: State[] = [
      {
        position: puzzleData.playerStartPosition,
        moves: 0,
      },
    ];
    visited[puzzleData.playerStartPosition.y][puzzleData.playerStartPosition.x] = true;

    console.log("Calculating minimum moves for puzzle: ", puzzleData);
    while (queue.length > 0) {
      const currentState = queue.shift()!;

      for (const direction of Object.values(Direction)) {
        const directionOffset = getDirectionOffset(direction);
        let        newPosition = { ...currentState.position };

        while (true) {
          newPosition = {
            x: newPosition.x + directionOffset.x,
            y: newPosition.y + directionOffset.y,
          };

          if (!this.isValidPosition(newPosition, puzzleData.width, puzzleData.height) || this.isObstacle(newPosition, puzzleData.obstacles)) {
            break;
          }

          if (!visited[newPosition.y][newPosition.x]) {
            visited[newPosition.y][newPosition.x] = true;
          }

          queue.push({
            position: newPosition,
            moves: currentState.moves + 1,
          });
          console.log("Inner loop");
        }
        console.log("Middle loop");
      }
      console.log("Outer loop");
    }

    console.log("Visited: ", visited);
    return -1; // The level is not completable
  }

  isValidPosition(position: { x: number; y: number; }, width: number, height: number): boolean {
    return position.x >= 0 && position.x < width && position.y >= 0 && position.y < height;
  }

  isObstacle(position: { x: number; y: number; }, obstacles: { x: number; y: number; }[]): boolean {
    return obstacles.some(o => o.x === position.x && o.y === position.y);
  }
}

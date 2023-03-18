import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, map } from 'rxjs';

export interface ScoreEntry {
  playerName: string;
  score: number;
  levelId: string;
  levelId_score: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class GameService {
  puzzle: Puzzle;
  db: AngularFireDatabase;

  constructor(private angularFireDatabase: AngularFireDatabase) {
    const width = 8;
    const height = 8;
    const playerStartPosition = { x: 3, y: 1 };
    this.puzzle = new Puzzle("testLevel1", width, height, playerStartPosition);
    this.db = angularFireDatabase;
  }

  get puzzleBoard(): Tile[][] {
    return this.puzzle.puzzleBoard;
  }
  
  async saveScore(playerName: string, score: number, levelId: string): Promise<void> {
    const entry: ScoreEntry = {
      playerName,
      score,
      levelId,
      levelId_score: `${levelId}_${score}`,
      timestamp: new Date().toISOString()
    };
    await this.db.list('/leaderboard').push(entry);
  }

  getLeaderboard(levelId: string = 'default'): Observable<ScoreEntry[]> {
    return this.db
      .list<ScoreEntry>('/leaderboard', (ref) =>
        ref.orderByChild('levelId_score').startAt(`${levelId}_`).endAt(`${levelId}_\uf8ff`).limitToFirst(10)
      )
      .valueChanges()
      .pipe(
        map((entries: ScoreEntry[]) => {
          return entries.sort((a, b) => a.score - b.score);
        })
      );
  }  
}

export class Puzzle {
  puzzleBoard: Tile[][];
  player: Player;
  moveCount: number;
  lastDirection: Direction | null;
  puzzleId: string;
  instanceId: string;

  constructor(name: string, width: number, height: number, playerStartPosition: { x: number; y: number }) {
    this.puzzleBoard = this.createGrid(width, height);
    this.player = new Player();
    this.initializePlayer(this.player, playerStartPosition);
    this.moveCount = 0;
    this.lastDirection = null;

    this.puzzleId = name;
    this.instanceId = `${this.puzzleId}-${Date.now()}`;
  }

  get isComplete(): boolean {
    return this.puzzleBoard
      .flat()
      .filter((tile) => tile.isOccupiable)
      .every((tile) => tile.visited);
  }

  createGrid(width: number, height: number): Tile[][] {
    return Array.from({ length: height }, () =>
      Array.from({ length: width }, () => new Tile())
    );
  }

  addObstacle(position: { x: number; y: number }): void {
    const desiredObstacleTile = this.puzzleBoard[position.y][position.x];
    if (!desiredObstacleTile.isOccupied) {
      const obstacle = new Obstacle();
      obstacle.setPosition(position.x, position.y);

      desiredObstacleTile.occupier = obstacle;
      desiredObstacleTile.isOccupiable = false;
    } else {
      throw new Error(
        `Tile at position (${position.x}, ${position.y}) is already occupied`
      );
    }
  }

  initializePlayer(player: Player, position: { x: number; y: number }): void {
    this.player = player;
    const desiredPlayerTile = this.puzzleBoard[position.y][position.x];

    if (desiredPlayerTile.isOccupiable && !desiredPlayerTile.isOccupied) {
      desiredPlayerTile.occupier = player;
      player.setPosition(position.x, position.y);
      desiredPlayerTile.visited = true;
    } else {
      throw new Error(
        `Cannot start the player at (${position.x}, ${position.y}).`
      );
    }
  }

  movePlayerUntilStopped(direction: Direction): void {
    const desiredDirection = this.getDirectionOffset(direction);
    let nextPosition = {
      x: this.player.position.x + desiredDirection.x,
      y: this.player.position.y + desiredDirection.y,
    };

    while (
      nextPosition.x >= 0 &&
      nextPosition.x < this.puzzleBoard[0].length &&
      nextPosition.y >= 0 &&
      nextPosition.y < this.puzzleBoard.length
    ) {
      const nextTile = this.puzzleBoard[nextPosition.y][nextPosition.x];
      nextPosition = {
        x: nextPosition.x + desiredDirection.x,
        y: nextPosition.y + desiredDirection.y,
      };

      if (nextTile.isOccupiable && !nextTile.isOccupied) {
        this.movePlayer(direction);
      }
    }

    if (this.lastDirection !== null && this.lastDirection !== direction) {
      this.moveCount++;
    }

    this.lastDirection = direction;
  }

  private movePlayer(direction: Direction): void {
    const currentTile = this.puzzleBoard[this.player.position.y][this.player.position.x];
    const desiredDirection = this.getDirectionOffset(direction);

    const newPosition = {
      x: this.player.position.x + desiredDirection.x,
      y: this.player.position.y + desiredDirection.y,
    };

    if (
      newPosition.x >= 0 &&
      newPosition.x < this.puzzleBoard[0].length &&
      newPosition.y >= 0 &&
      newPosition.y < this.puzzleBoard.length
    ) {
      const desiredTile = this.puzzleBoard[newPosition.y][newPosition.x];
      if (desiredTile.isOccupiable && !desiredTile.isOccupied) {
        currentTile.occupier = null;
        desiredTile.occupier = this.player;
        this.player.setPosition(newPosition.x, newPosition.y);
        desiredTile.visited = true;
      }
    }
  }

  private getDirectionOffset(direction: Direction): { x: number; y: number } {
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
        throw new Error('Invalid direction');
    }
  }
}

export class Actor {
  symbol: string;
  position: { x: number; y: number };

  constructor(symbol: string) {
    this.symbol = symbol;
    this.position = { x: 0, y: 0 };
  }

  setPosition(x: number, y: number): void {
    this.position.x = x;
    this.position.y = y;
  }
}

export class Player extends Actor {
  constructor() {
    super('P');
  }
}

export class Obstacle extends Actor {
  constructor() {
    super('O');
  }
}

export enum Direction {
  Up,
  Down,
  Left,
  Right,
}

export class Tile {
  occupier: Actor | null;
  isOccupiable: boolean;
  visited: boolean;

  constructor() {
    this.occupier = null;
    this.isOccupiable = true;
    this.visited = false;
  }

  get isOccupied(): boolean {
    return this.occupier !== null;
  }

  get displayValue(): string {
    if (this.occupier) {
      return this.occupier.symbol;
    } else if (!this.isOccupiable) {
      return 'X';
    } else if (this.visited) {
      return '.';
    } else {
      return ' ';
    }
  }
}


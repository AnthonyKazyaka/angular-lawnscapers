import { Player } from './Player';
import { PuzzleData } from "./PuzzleData";
import { Tile } from "./Tile";
import { Direction, getDirectionOffset } from "../direction/Direction";

export class Puzzle {
  public id: string;
  public name: string;
  public width: number;
  public height: number;
  public puzzleBoard: Tile[][];
  player: Player;
  moveCount: number;
  isComplete: boolean;

  constructor(puzzleData: PuzzleData) {
    this.id = puzzleData.id;
    this.name = puzzleData.name;
    this.width = puzzleData.width;
    this.height = puzzleData.height;
    this.isComplete = false;
    this.moveCount = 0;
    this.player = new Player(puzzleData.playerStartPosition);
    this.puzzleBoard = [];
    const obstaclePositions: string[] = puzzleData.obstacles.map(obstacle => `${obstacle.x}-${obstacle.y}`);
  
    for (let y = 0; y < this.height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < this.width; x++) {
        const position = `${x}-${y}`;
        const isOccupiable = !obstaclePositions.includes(position);
        const tile = new Tile(isOccupiable);
        row.push(tile);
      }
      this.puzzleBoard.push(row);
    }
  
    this.puzzleBoard[this.player.position.y][this.player.position.x].isOccupied = true;
  }
  
  getDisplayBoard(): string[][] {
    const displayBoard: string[][] = [];
  
    for (let i = 0; i < this.height; i++) {
      displayBoard[i] = [];
      for (let j = 0; j < this.width; j++) {
        if (this.player.position.y === i && this.player.position.x === j) { // Swap i and j here
          displayBoard[i][j] = "player";
          console.log("set player class on cell at i:", i, "j:", j)
        } else {
          const tile = this.puzzleBoard[i][j];
          displayBoard[i][j] = tile.isOccupiable
            ? tile.visited
              ? "visited"
              : "unvisited"
            : "obstacle";
        }
      }
    }
  
    return displayBoard;
  }  

  addObstacle(obstacle: { x: number; y: number; }): void {
    this.puzzleBoard[obstacle.y][obstacle.x].isOccupiable = false;
  }

  movePlayerUntilStopped(direction: Direction): void {
    const directionOffset = getDirectionOffset(direction);
    let currentTile = this.puzzleBoard[this.player.position.y][this.player.position.x];
    currentTile.setOccupier(this.player);

    while (true) {
      const newPosition = {
        x: this.player.position.x + directionOffset.x,
        y: this.player.position.y + directionOffset.y,
      };
  
      if (newPosition.x < 0 ||
        newPosition.x >= this.width ||
        newPosition.y < 0 ||
        newPosition.y >= this.height) {
        break;
      }
  
      const newTile = this.puzzleBoard[newPosition.y][newPosition.x];
      if (!newTile.isOccupiable || newTile.isOccupied) {
        break;
      }
  
      this.moveCount++; // Increment moveCount
      this.player.position = newPosition;
      currentTile.setOccupier(null);
      newTile.setOccupier(this.player);
      currentTile = newTile;
    }
  }
}

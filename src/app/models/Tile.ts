import { Player } from './Player';

export class Tile {
  isOccupiable: boolean;
  isOccupied: boolean;
  visited: boolean;
  occupier: Player | null;

  constructor(isOccupiable: boolean, occupier: Player | null = null) {
    this.isOccupiable = isOccupiable;
    this.isOccupied = occupier !== null;
    this.visited = false;
    this.occupier = occupier;
  }

  setOccupier(occupier: Player | null): void {
    this.occupier = occupier;
    this.isOccupied = occupier !== null;
    this.visited = this.visited || this.isOccupied;
  }
}

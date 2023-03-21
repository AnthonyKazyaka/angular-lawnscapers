
export interface PuzzleData {
  id: string;
  name: string;
  width: number;
  height: number;
  playerStartPosition: { x: number; y: number; };
  obstacles: { x: number; y: number; }[];
}

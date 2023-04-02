export interface PuzzleData {
  id: string;
  name: string;
  creator: string | null;
  width: number;
  height: number;
  playerStartPosition: { x: number; y: number; };
  obstacles: { x: number; y: number; }[];
  created_at: string;
}

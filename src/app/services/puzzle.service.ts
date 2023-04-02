import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';
import { PuzzleData } from '../models/PuzzleData';

@Injectable({
  providedIn: 'root',
})
export class PuzzleService {
  constructor(private databaseService: DatabaseService) {}

  getPuzzlesData(): Promise<PuzzleData[]> {
    return this.databaseService.getPuzzlesData();
  }

  getCommunityPuzzlesData(): Promise<PuzzleData[]> {
    return this.databaseService.getCommunityPuzzlesData();
  }

  savePuzzle(puzzleData: PuzzleData): Promise<void> {
    return this.databaseService.savePuzzle(puzzleData);
  }
}

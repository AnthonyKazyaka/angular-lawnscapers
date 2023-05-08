import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { DatabaseService } from './database.service';
import { PuzzleData } from '../models/PuzzleData';

describe('GameService', () => {
  let service: GameService;
  let databaseService: jasmine.SpyObj<DatabaseService>;

  beforeEach(() => {
    const databaseServiceSpy = jasmine.createSpyObj('DatabaseService', ['getPuzzlesData']);

    TestBed.configureTestingModule({
      providers: [
        GameService,
        { provide: DatabaseService, useValue: databaseServiceSpy }
      ]
    });

    service = TestBed.inject(GameService);
    databaseService = TestBed.inject(DatabaseService) as jasmine.SpyObj<DatabaseService>;
  });

  it('should load puzzle from the database', async () => {
    const puzzleData: PuzzleData[] = [
      // Replace this with actual puzzle data from your application
    ];
    databaseService.getOfficialPuzzlesData.and.returnValue(Promise.resolve(puzzleData));

    await service.initializePuzzle('testPuzzleId');

    expect(databaseService.getOfficialPuzzlesData).toHaveBeenCalled();
    expect(service.puzzle).toBeDefined();
    // Add more assertions to check if the puzzle object is created as expected
  });
});

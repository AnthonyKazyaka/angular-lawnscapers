import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PuzzleBoardComponent } from './puzzle-board.component';
import { Puzzle } from '../models/Puzzle';
import { Player } from '../models/Player';
import { Direction } from '../models/Direction';

describe('PuzzleBoardComponent', () => {
  let component: PuzzleBoardComponent;
  let fixture: ComponentFixture<PuzzleBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PuzzleBoardComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleBoardComponent);
    component = fixture.componentInstance;

    component.puzzle = new Puzzle({
      id: 'testPuzzleId',
      name: 'Test Puzzle',
      width: 5,
      height: 5,
      playerStartPosition: { x: 0, y: 0 },
      obstacles: [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ],
    });

    component.player = new Player({ x: 0, y: 0 });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct player position', () => {
    if (component.player) {
      const playerPosition = component.player.position;
      expect(playerPosition.x).toEqual(0);
      expect(playerPosition.y).toEqual(0);
    } else {
      fail('Player is not initialized');
    }
  });

  it('should update player position when onSwipe is called', () => {
    if (component.player) {
      component.onSwipe(Direction.Right);
      expect(component.player.position.x).toEqual(1);
      expect(component.player.position.y).toEqual(0);
    } else {
      fail('Player is not initialized');
    }
  });

  it('should not allow the player to move into an obstacle', () => {
    if (component.player) {
      component.onSwipe(Direction.Down);
      component.onSwipe(Direction.Right);
      expect(component.player.position.x).toEqual(0);
      expect(component.player.position.y).toEqual(0);
    } else {
      fail('Player is not initialized');
    }
  });
});

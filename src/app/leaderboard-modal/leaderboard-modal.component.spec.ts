import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardModalComponent } from './leaderboard-modal.component';

describe('LeaderboardModalComponent', () => {
  let component: LeaderboardModalComponent;
  let fixture: ComponentFixture<LeaderboardModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaderboardModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaderboardModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

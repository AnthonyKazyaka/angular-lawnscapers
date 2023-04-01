import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelSelectScreenComponent } from './level-select-screen.component';

describe('LevelSelectComponent', () => {
  let component: LevelSelectScreenComponent;
  let fixture: ComponentFixture<LevelSelectScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LevelSelectScreenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LevelSelectScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

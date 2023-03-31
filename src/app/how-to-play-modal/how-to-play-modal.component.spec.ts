import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowToPlayModalComponent } from './how-to-play-modal.component';

describe('HowToPlayModalComponent', () => {
  let component: HowToPlayModalComponent;
  let fixture: ComponentFixture<HowToPlayModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HowToPlayModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HowToPlayModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

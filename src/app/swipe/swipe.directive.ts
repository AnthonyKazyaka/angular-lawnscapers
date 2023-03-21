import { Directive, Output, EventEmitter, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Direction } from "../direction/Direction";
import * as Hammer from 'hammerjs';

@Directive({
  selector: '[appSwipe]'
})
export class SwipeDirective implements OnInit, OnDestroy {
  @Output() swipe = new EventEmitter<Direction>();

  private hammerManager: HammerManager;

  constructor(private el: ElementRef) {
    this.hammerManager = new Hammer.Manager(this.el.nativeElement);
  }

  ngOnInit(): void {
    this.hammerManager.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_ALL }));

    this.hammerManager.on('swipe', (event: HammerInput) => {
      let direction: Direction | undefined;

      switch (event.direction) {
        case Hammer.DIRECTION_UP:
          direction = Direction.Up;
          break;
        case Hammer.DIRECTION_DOWN:
          direction = Direction.Down;
          break;
        case Hammer.DIRECTION_LEFT:
          direction = Direction.Left;
          break;
        case Hammer.DIRECTION_RIGHT:
          direction = Direction.Right;
          break;
      }

      if (direction !== undefined) {
        this.swipe.emit(direction);
      }
    });
  }

  ngOnDestroy(): void {
    this.hammerManager.off('swipe');
  }
}

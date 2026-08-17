import { AfterViewChecked, Directive, DoCheck, ElementRef, OnDestroy, inject } from '@angular/core';

@Directive({ selector: '[appAnimatedList]' })
export class AnimatedList implements DoCheck, AfterViewChecked, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private previousPositions = new Map<string, number>();
  private beforeRenderPositions = new Map<string, number>();
  private animations = new Map<string, Animation>();

  ngDoCheck(): void {
    this.beforeRenderPositions = this.measure();
  }

  ngAfterViewChecked(): void {
    const currentPositions = this.measure();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.previousPositions = currentPositions;
      return;
    }

    for (const item of this.items()) {
      const key = item.dataset['animationKey'];
      if (!key) continue;
      const currentTop = currentPositions.get(key);
      const previousTop = this.beforeRenderPositions.get(key) ?? this.previousPositions.get(key);
      this.animations.get(key)?.cancel();

      if (currentTop !== undefined && previousTop !== undefined && currentTop !== previousTop) {
        this.animations.set(key, item.animate(
          [{ transform: `translateY(${previousTop - currentTop}px)` }, { transform: 'translateY(0)' }],
          { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)' },
        ));
      } else if (!this.previousPositions.has(key)) {
        this.animations.set(key, item.animate(
          [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 240, easing: 'ease-out' },
        ));
      }
    }

    this.previousPositions = currentPositions;
  }

  ngOnDestroy(): void {
    for (const animation of this.animations.values()) animation.cancel();
  }

  private items(): HTMLElement[] {
    return Array.from(this.host.children).filter((item): item is HTMLElement =>
      item instanceof HTMLElement && Boolean(item.dataset['animationKey']),
    );
  }

  private measure(): Map<string, number> {
    return new Map(this.items().map((item) => [item.dataset['animationKey']!, item.offsetTop]));
  }
}

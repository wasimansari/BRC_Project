import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appSmoothScroll]'
})
export class SmoothScrollDirective {
  @Input() scrollOffset = 0;
  @Input() scrollDuration = 800;

  constructor(private el: ElementRef) {}

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.currentTarget as HTMLAnchorElement;
    const href = target.getAttribute('href');

    // Only apply to anchor links (starting with #)
    if (href && href.startsWith('#')) {
      event.preventDefault();
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        this.smoothScrollTo(targetElement);
      }
    }
  }

  private smoothScrollTo(element: HTMLElement): void {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - this.scrollOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      
      // Ease-out cubic function for smooth deceleration
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      
      const progress = Math.min(timeElapsed / this.scrollDuration, 1);
      const easeProgress = easeOutCubic(progress);
      
      window.scrollTo(0, startPosition + distance * easeProgress);

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  }
}
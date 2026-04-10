import { Directive, ElementRef, Renderer2, OnInit, OnDestroy, Input } from '@angular/core';

@Directive({
  selector: '[appScrollAnimate]'
})
export class ScrollAnimateDirective implements OnInit, OnDestroy {
  @Input() animationType: 'fadeInUp' | 'fadeInLeft' | 'fadeInRight' | 'fadeIn' | 'zoomIn' | 'slideUp' = 'fadeInUp';
  @Input() animationDelay: number = 0;
  @Input() animationDuration: number = 0.6;
  @Input() threshold: number = 0.1;

  private observer: IntersectionObserver | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    // Set initial styles
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '0');
    this.renderer.setStyle(this.el.nativeElement, 'transform', this.getTransformInitial());
    this.renderer.setStyle(this.el.nativeElement, 'transition', `opacity ${this.animationDuration}s ease-out, transform ${this.animationDuration}s ease-out`);
    this.renderer.setStyle(this.el.nativeElement, 'transitionDelay', `${this.animationDelay}s`);

    // Set up Intersection Observer
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateIn();
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      },
      {
        threshold: this.threshold,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  private getTransformInitial(): string {
    switch (this.animationType) {
      case 'fadeInUp':
        return 'translateY(40px)';
      case 'fadeInLeft':
        return 'translateX(-40px)';
      case 'fadeInRight':
        return 'translateX(40px)';
      case 'zoomIn':
        return 'scale(0.9)';
      case 'slideUp':
        return 'translateY(60px)';
      default:
        return 'translateY(30px)';
    }
  }

  private animateIn() {
    this.renderer.setStyle(this.el.nativeElement, 'opacity', '1');
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'translate(0) scale(1)');
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Eduubuzz';
  showScrollTop = false;
  scrollThreshold = 300;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.showScrollTop = window.scrollY > this.scrollThreshold;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    const tag = target && target.tagName ? target.tagName.toLowerCase() : '';

    // If the user is typing in an input, textarea, select, or contenteditable element,
    // allow default behavior (so spacebar and enter work normally).
    const isFormElement = tag === 'input' || tag === 'textarea' || tag === 'select' || (target ? target.isContentEditable : false);
    if (isFormElement) return;

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.scrollToTop();
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

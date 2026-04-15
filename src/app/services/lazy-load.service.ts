import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LazyLoadService {
  private observer!: IntersectionObserver;

  createObserver(callback: (entry: IntersectionObserverEntry) => void) {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry);
          this.observer.unobserve(entry.target);
        }
      });
    });

    return this.observer;
  }

  observe(element: Element, observer: IntersectionObserver) {
    observer.observe(element);
  }

  unobserve(element: Element) {
    this.observer?.unobserve(element);
  }
}
import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { LazyLoadService } from '../services/lazy-load.service';

@Directive({
  selector: '[appLazyImage]',
  standalone: true,
})
export class LazyImageDirective implements OnInit, OnDestroy {
  @Input('appLazyImage') imageSrc!: string;
  @Input() placeholder: string = 'assets/images/placeholder.png';

  private observer!: IntersectionObserver;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private lazyService: LazyLoadService
  ) {}

  ngOnInit(): void {
    const img = this.el.nativeElement;

    // Set placeholder initially
    img.src = this.placeholder;

    this.observer = this.lazyService.createObserver((entry) => {
      const target = entry.target as HTMLImageElement;

      target.src = this.imageSrc;
      target.classList.add('lazy-loaded');
    });

    this.lazyService.observe(img, this.observer);
  }

  ngOnDestroy(): void {
    this.lazyService.unobserve(this.el.nativeElement);
  }
}
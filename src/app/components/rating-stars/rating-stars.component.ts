import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-1">
      @for (i of stars; track i) {
        <svg [class]="starClass" fill="currentColor" viewBox="0 0 24 24"
             [style.color]="i <= fullStars ? 'hsl(42,80%,45%)' : '#d1d5db'">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      }
      <span class="text-xs text-gray-500 ml-1">{{ rating }}</span>
    </div>
  `
})
export class RatingStarsComponent {
  @Input() rating = 0;
  @Input() size: 'sm' | 'md' = 'sm';
  get fullStars() { return Math.round(this.rating); }
  get stars() { return [1,2,3,4,5]; }
  get starClass() { return this.size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'; }
}

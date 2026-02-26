import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-cairo font-semibold"
          [ngClass]="badgeClass">
      <span class="w-1.5 h-1.5 rounded-full" [ngClass]="dotClass"></span>
      {{ label }}
    </span>
  `
})
export class StatusBadgeComponent {
  @Input() status: 'active' | 'completed' | 'upcoming' = 'upcoming';
  get label() {
    return { active: 'نشط', completed: 'مكتمل', upcoming: 'قادم' }[this.status];
  }
  get badgeClass() {
    return {
      active: 'bg-green-100 text-green-700',
      completed: 'bg-gray-100 text-gray-600',
      upcoming: 'bg-blue-100 text-blue-700',
    }[this.status];
  }
  get dotClass() {
    return {
      active: 'bg-green-500',
      completed: 'bg-gray-400',
      upcoming: 'bg-blue-500',
    }[this.status];
  }
}

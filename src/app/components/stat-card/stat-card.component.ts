import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-glass rounded-xl p-5">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm text-gray-500 font-cairo">{{ title }}</span>
        <div class="w-10 h-10 rounded-lg flex items-center justify-center" style="background:hsl(42,80%,45%,0.15)">
          <span style="color:hsl(42,80%,45%)" [innerHTML]="icon"></span>
        </div>
      </div>
      <p class="text-3xl font-bold font-cairo" style="color:hsl(220,20%,10%)">{{ value }}</p>
      <p *ngIf="subtitle" class="text-xs text-gray-400 mt-1 font-cairo">{{ subtitle }}</p>
      <p *ngIf="trend" class="text-xs mt-1 font-cairo" [class.text-green-600]="trend.positive" [class.text-red-500]="!trend.positive">
        {{ trend.positive ? '↑' : '↓' }} {{ trend.value }}% عن الشهر السابق
      </p>
    </div>
  `
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() icon = '';
  @Input() subtitle = '';
  @Input() trend?: { value: number; positive: boolean };
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { RatingStarsComponent } from '../../components/rating-stars/rating-stars.component';
import { ServiceBadgeComponent } from '../../components/service-badge/service-badge.component';
import { CRITERIA_LABELS, ServiceType } from '../../models/data.models';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule, RatingStarsComponent, ServiceBadgeComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-cairo font-bold">التقييمات</h1>
        <p class="text-gray-500 text-sm mt-1">تقييمات أداء الموظفين في الفعاليات</p>
      </div>

      <div class="space-y-3">
        @for (ev of ds.evaluations(); track ev.id) {
          <div class="card-glass rounded-xl p-5 animate-fade-in">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="font-cairo font-bold">{{ ev.employeeName }}</p>
                <p class="text-xs text-gray-400">{{ ev.eventName }} • {{ ev.date }}</p>
              </div>
              <div class="flex items-center gap-3">
                <app-service-badge [type]="ev.serviceType"/>
                <app-rating-stars [rating]="ev.overallRating" size="sm"/>
              </div>
            </div>
            <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-3">
              @for (key of criteriaKeys; track key) {
                <div class="bg-gray-50 rounded-md p-2 text-center">
                  <p class="text-[10px] text-gray-400 font-cairo leading-tight">{{ criteriaLabels[key]?.ar }}</p>
                  <p class="text-sm font-bold" style="color:hsl(42,80%,45%)">{{ getCriteriaValue(ev, key) }}/5</p>
                </div>
              }
            </div>
            @if (ev.notes) {
              <p class="text-xs text-gray-400 bg-gray-50 rounded-md p-2 font-cairo">{{ ev.notes }}</p>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class EvaluationsComponent {
  ds = inject(DataService);
  criteriaKeys = Object.keys(CRITERIA_LABELS);
  criteriaLabels = CRITERIA_LABELS;
  getCriteriaValue(ev: any, key: string) { return ev.criteria[key] ?? 0; }
}

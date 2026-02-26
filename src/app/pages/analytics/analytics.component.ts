import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { RatingStarsComponent } from '../../components/rating-stars/rating-stars.component';
import { CRITERIA_LABELS } from '../../models/data.models';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RatingStarsComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-cairo font-bold">التحليلات</h1>
        <p class="text-gray-500 text-sm mt-1">تحليل أداء الموظفين والفعاليات</p>
      </div>

      <div class="card-glass rounded-xl p-5">
        <h2 class="font-cairo font-bold text-lg mb-4">مدير المشروع</h2>
        <div class="flex flex-wrap gap-2 mb-6">
          @for (pm of projectManagers(); track pm.id) {
            <button (click)="selectedManager.set(pm.id)"
                    class="px-3 py-1.5 rounded-lg text-xs font-cairo transition-all"
                    [style]="selectedManager() === pm.id ? 'background:hsl(42,80%,45%); color:white' : 'background:#f3f4f6; color:#6b7280'">
              {{ pm.name }}
            </button>
          }
        </div>

        @if (filteredEmployees().length === 0) {
          <p class="text-center text-gray-400 font-cairo py-8">لا توجد تقييمات من هذا المدير</p>
        } @else {
          <div class="flex flex-wrap gap-2 mb-6">
            @for (emp of filteredEmployees(); track emp.id) {
              <button (click)="selectedEmployee.set(emp.id)"
                      class="px-3 py-1.5 rounded-lg text-xs font-cairo transition-all"
                      [style]="selectedEmployee() === emp.id ? 'background:hsl(220,16%,93%); color:#1f2937; font-weight:600' : 'background:#f9fafb; color:#6b7280'">
                {{ emp.nameAr }}
              </button>
            }
          </div>

          @if (selectedEmployeeData()) {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div class="card-glass rounded-xl p-4">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold"
                       style="background:hsl(42,80%,45%,0.15); color:hsl(42,80%,45%)">{{ selectedEmployeeData()!.avatar }}</div>
                  <div>
                    <p class="font-cairo font-bold">{{ selectedEmployeeData()!.nameAr }}</p>
                    <app-rating-stars [rating]="selectedEmployeeData()!.avgRating"/>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  @for (key of criteriaKeys; track key) {
                    <div class="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <span class="text-xs text-gray-400 font-cairo">{{ criteriaLabels[key]?.ar }}</span>
                      <span class="text-sm font-bold" style="color:hsl(42,80%,45%)">{{ getCriteriaAvg(key) }}/5</span>
                    </div>
                  }
                </div>
              </div>

              <div class="card-glass rounded-xl p-4">
                <h3 class="font-cairo font-bold mb-4">تاريخ التقييمات</h3>
                <div class="space-y-3">
                  @for (ev of employeeEvals(); track ev.id) {
                    <div class="p-3 bg-gray-50 rounded-lg">
                      <div class="flex justify-between items-center mb-1">
                        <span class="text-sm font-cairo text-gray-700">{{ ev.eventName }}</span>
                        <app-rating-stars [rating]="ev.overallRating" size="sm"/>
                      </div>
                      <p class="text-xs text-gray-400">{{ ev.date }}</p>
                      @if (ev.notes) {
                        <p class="text-xs text-gray-500 mt-1 font-cairo">{{ ev.notes }}</p>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        }
      </div>

      <div class="card-glass rounded-xl p-5">
        <h2 class="font-cairo font-bold text-lg mb-4">تصنيف الموظفين</h2>
        <div class="space-y-3">
          @for (emp of rankedEmployees(); track emp.id; let i = $index) {
            <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                   [style]="i < 3 ? 'background:hsl(42,80%,45%); color:white' : 'background:#e5e7eb; color:#374151'">{{ i+1 }}</div>
              <div class="flex-1 min-w-0">
                <p class="font-cairo font-semibold text-sm">{{ emp.nameAr }}</p>
                <p class="text-xs text-gray-400">{{ emp.role }}</p>
              </div>
              <app-rating-stars [rating]="emp.avgRating" size="sm"/>
              <span class="text-xs text-gray-400">{{ emp.totalEvents }} فعالية</span>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AnalyticsComponent {
  ds = inject(DataService);
  selectedManager = signal('');
  selectedEmployee = signal('');
  criteriaKeys = Object.keys(CRITERIA_LABELS);
  criteriaLabels = CRITERIA_LABELS;

  projectManagers = computed(() => {
    const map = new Map<string, string>();
    this.ds.events().forEach(ev => ev.services.forEach(s => map.set(s.projectManagerId, s.projectManagerName)));
    const list = Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    if (list.length && !this.selectedManager()) this.selectedManager.set(list[0].id);
    return list;
  });

  managerEvals = computed(() => this.ds.evaluations().filter(ev => ev.evaluatorId === this.selectedManager()));
  filteredEmployees = computed(() => {
    const ids = [...new Set(this.managerEvals().map(ev => ev.employeeId))];
    const emps = this.ds.employees().filter(e => ids.includes(e.id));
    if (emps.length && !ids.includes(this.selectedEmployee())) this.selectedEmployee.set(emps[0]?.id ?? '');
    return emps;
  });
  selectedEmployeeData = computed(() => this.ds.employees().find(e => e.id === this.selectedEmployee()));
  employeeEvals = computed(() => this.managerEvals().filter(ev => ev.employeeId === this.selectedEmployee()));
  rankedEmployees = computed(() => [...this.ds.employees()].sort((a,b) => b.avgRating - a.avgRating));

  getCriteriaAvg(key: string) {
    const evals = this.employeeEvals();
    if (!evals.length) return 0;
    const avg = evals.reduce((a, ev) => a + ((ev.criteria as any)[key] ?? 0), 0) / evals.length;
    return Math.round(avg * 10) / 10;
  }
}

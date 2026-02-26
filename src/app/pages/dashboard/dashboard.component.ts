import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { StatCardComponent } from '../../components/stat-card/stat-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { RatingStarsComponent } from '../../components/rating-stars/rating-stars.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatCardComponent, StatusBadgeComponent, RatingStarsComponent],
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-cairo font-bold">لوحة التحكم</h1>
        <p class="text-gray-500 text-sm mt-1">نظرة عامة على الفعاليات والتقييمات</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-card title="إجمالي الفعاليات" [value]="ds.events().length" [icon]="calIcon" subtitle="هذا الموسم"/>
        <app-stat-card title="الفعاليات النشطة" [value]="activeEvents()" [icon]="trendIcon" [trend]="{value:15,positive:true}"/>
        <app-stat-card title="الموظفين" [value]="ds.employees().length" [icon]="usersIcon" subtitle="موظف مسجل"/>
        <app-stat-card title="متوسط التقييم" [value]="avgRating()" [icon]="clipIcon" [trend]="{value:5,positive:true}"/>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="card-glass rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-cairo font-bold text-lg">الفعاليات الأخيرة</h2>
            <a routerLink="/events" class="text-xs hover:underline" style="color:hsl(42,80%,45%)">عرض الكل ←</a>
          </div>
          <div class="space-y-3">
            @for (event of ds.events(); track event.id) {
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div>
                  <p class="font-cairo font-semibold text-sm">{{ event.nameAr }}</p>
                  <p class="text-xs text-gray-400">{{ event.location }} • {{ event.client }}</p>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-xs text-gray-400">{{ event.services.length }} خدمات</span>
                  <app-status-badge [status]="event.status"/>
                </div>
              </div>
            }
          </div>
        </div>

        <div class="card-glass rounded-xl p-5">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-cairo font-bold text-lg">آخر التقييمات</h2>
            <a routerLink="/evaluations" class="text-xs hover:underline" style="color:hsl(42,80%,45%)">عرض الكل ←</a>
          </div>
          <div class="space-y-3">
            @for (ev of ds.evaluations().slice(0,4); track ev.id) {
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div>
                  <p class="font-cairo font-semibold text-sm">{{ ev.employeeName }}</p>
                  <p class="text-xs text-gray-400">{{ ev.eventName }}</p>
                </div>
                <app-rating-stars [rating]="ev.overallRating" size="sm"/>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="card-glass rounded-xl p-5">
        <h2 class="font-cairo font-bold text-lg mb-4">أفضل الموظفين أداءً</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (emp of topEmployees(); track emp.id; let i = $index) {
            <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                   style="background:hsl(42,80%,45%,0.15); color:hsl(42,80%,45%)">{{ i+1 }}</div>
              <div class="flex-1 min-w-0">
                <p class="font-cairo font-semibold text-sm truncate">{{ emp.nameAr }}</p>
                <app-rating-stars [rating]="emp.avgRating" size="sm"/>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent {
  ds = inject(DataService);
  activeEvents = computed(() => this.ds.events().filter(e => e.status === 'active').length);
  avgRating = computed(() => {
    const emps = this.ds.employees();
    if (!emps.length) return '0';
    return (emps.reduce((a, e) => a + e.avgRating, 0) / emps.length).toFixed(1);
  });
  topEmployees = computed(() => [...this.ds.employees()].sort((a,b) => b.avgRating - a.avgRating).slice(0,4));

  calIcon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
  trendIcon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>';
  usersIcon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>';
  clipIcon = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>';
}

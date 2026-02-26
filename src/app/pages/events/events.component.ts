import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { ServiceBadgeComponent } from '../../components/service-badge/service-badge.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StatusBadgeComponent, ServiceBadgeComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-cairo font-bold">الفعاليات</h1>
          <p class="text-gray-500 text-sm mt-1">اضغط على الفعالية لعرض الموظفين وتقييمهم</p>
        </div>
        <button (click)="showDialog.set(true)" class="px-4 py-2 rounded-lg text-sm font-cairo font-semibold text-white" style="background:hsl(42,80%,45%)">
          + إضافة فعالية
        </button>
      </div>

      <div class="space-y-4">
        @for (event of ds.events(); track event.id) {
          <div class="card-glass rounded-xl p-5 cursor-pointer hover:border-yellow-300 hover:shadow-lg transition-all animate-fade-in"
               (click)="router.navigate(['/events', event.id])">
            <div class="flex items-start justify-between mb-2">
              <div>
                <div class="flex items-center gap-3">
                  <h2 class="font-cairo font-bold text-lg">{{ event.nameAr }}</h2>
                  <app-status-badge [status]="event.status"/>
                </div>
                <p class="text-sm text-gray-400 mt-1">{{ event.name }}</p>
              </div>
              <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-md">{{ event.client }}</span>
            </div>
            <p *ngIf="event.managerName" class="text-sm text-gray-500 mb-3 font-cairo">مدير الفعالية: <span class="text-gray-800 font-medium">{{ event.managerName }}</span></p>
            <div class="flex items-center gap-6 text-sm text-gray-400 mb-4">
              <span>📍 {{ event.location }}</span>
              <span>📅 {{ event.startDate }} → {{ event.endDate }}</span>
            </div>
            <div *ngIf="event.services.length" class="border-t border-gray-100 pt-4">
              <p class="font-cairo font-semibold text-sm mb-3 text-gray-600">الخدمات ({{ event.services.length }})</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                @for (s of event.services; track s.id) {
                  <div class="bg-gray-50 rounded-lg p-3 space-y-1">
                    <app-service-badge [type]="s.type"/>
                    <p class="text-xs text-gray-400">مدير المشروع: <span class="text-gray-700">{{ s.projectManagerName }}</span></p>
                    <p class="text-xs text-gray-400">عدد الموظفين: <span class="text-gray-700">{{ s.employeeIds.length }}</span></p>
                  </div>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    @if (showDialog()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-lg mx-4 space-y-4" dir="rtl">
          <h2 class="font-cairo font-bold text-lg">إضافة فعالية جديدة</h2>
          <input [(ngModel)]="form.name" placeholder="اسم الفعالية بالإنجليزية" class="input-field w-full"/>
          <input [(ngModel)]="form.nameAr" placeholder="اسم الفعالية بالعربية" class="input-field w-full"/>
          <input [(ngModel)]="form.location" placeholder="الموقع" class="input-field w-full"/>
          <input [(ngModel)]="form.client" placeholder="العميل" class="input-field w-full"/>
          <div class="grid grid-cols-2 gap-3">
            <input [(ngModel)]="form.startDate" type="date" class="input-field w-full"/>
            <input [(ngModel)]="form.endDate" type="date" class="input-field w-full"/>
          </div>
          <select [(ngModel)]="form.status" class="input-field w-full">
            <option value="upcoming">قادم</option>
            <option value="active">نشط</option>
            <option value="completed">مكتمل</option>
          </select>
          <div class="flex gap-3 justify-end">
            <button (click)="showDialog.set(false)" class="px-4 py-2 text-sm border border-gray-200 rounded-lg font-cairo">إلغاء</button>
            <button (click)="submit()" class="px-4 py-2 text-sm text-white rounded-lg font-cairo font-bold" style="background:hsl(42,80%,45%)">حفظ</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`.input-field { border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; font-family:'Cairo',sans-serif; outline:none; width:100%; } .input-field:focus { border-color:hsl(42,80%,45%); }`]
})
export class EventsComponent {
  ds = inject(DataService);
  router = inject(Router);
  showDialog = signal(false);
  form = { name:'', nameAr:'', location:'', client:'', startDate:'', endDate:'', status:'upcoming' as 'active'|'completed'|'upcoming' };

  async submit() {
    if (!this.form.name || !this.form.nameAr) return;
    await this.ds.addEvent(this.form);
    this.showDialog.set(false);
    this.form = { name:'', nameAr:'', location:'', client:'', startDate:'', endDate:'', status:'upcoming' };
  }
}

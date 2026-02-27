import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { ServiceBadgeComponent } from '../../components/service-badge/service-badge.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, StatusBadgeComponent, ServiceBadgeComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-cairo font-bold">الفعاليات</h1>
          <p class="text-gray-500 text-sm mt-1">اضغط على الفعالية لعرض الموظفين وتقييمهم</p>
        </div>
        <button (click)="showDialog.set(true)"
                class="px-4 py-2 rounded-lg text-sm font-cairo font-semibold text-white"
                style="background:hsl(42,80%,45%)">
          + إضافة فعالية
        </button>
      </div>

      <!-- Events List -->
      <div class="space-y-4">
        @for (event of ds.events(); track event.id) {
          <div class="card-glass rounded-xl p-5 cursor-pointer hover:border-yellow-300 hover:shadow-lg transition-all animate-fade-in"
               (click)="router.navigate(['/events', event.id])">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-3">
                <h2 class="font-cairo font-bold text-lg">{{ event.nameAr }}</h2>
                <app-status-badge [status]="event.status"/>
              </div>
              @if (event.client) {
                <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-md">{{ event.client }}</span>
              }
            </div>
            @if (event.managerName) {
              <p class="text-sm text-gray-500 mb-2 font-cairo">
                👤 مدير الفعالية: <span class="text-gray-800 font-medium">{{ event.managerName }}</span>
              </p>
            }
            @if (event.location || event.startDate) {
              <div class="flex items-center gap-6 text-sm text-gray-400 mb-3">
                @if (event.location) { <span>📍 {{ event.location }}</span> }
                @if (event.startDate) { <span>📅 {{ event.startDate }} → {{ event.endDate }}</span> }
              </div>
            }
            @if (event.services.length) {
              <div class="border-t border-gray-100 pt-3">
                <p class="font-cairo font-semibold text-sm mb-2 text-gray-600">الخدمات ({{ event.services.length }})</p>
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
            }
          </div>
        }
      </div>
    </div>

    <!-- Add Event Dialog -->
    @if (showDialog()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl p-6 w-full max-w-sm mx-4 space-y-5" dir="rtl">
          <h2 class="font-cairo font-bold text-lg">إضافة فعالية جديدة</h2>

          <!-- Event Name -->
          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">اسم الفعالية <span class="text-red-400">*</span></label>
            <input [(ngModel)]="nameAr" placeholder="مثال: موسم الرياض 2025"
                   class="input-field w-full" autofocus/>
          </div>

          <!-- Manager -->
          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">مدير الفعالية</label>
            <select (change)="onManagerChange($event)" class="input-field w-full">
              <option value="">-- اختر مدير الفعالية --</option>
              @for (emp of ds.employees(); track emp.id) {
                <option [value]="emp.id">{{ emp.nameAr }} — {{ emp.role }}</option>
              }
            </select>
            @if (managerName) {
              <p class="text-xs font-cairo" style="color:hsl(42,80%,45%)">✓ {{ managerName }}</p>
            }
          </div>

          <div class="flex gap-3 justify-end pt-1">
            <button (click)="closeDialog()"
                    class="px-4 py-2 text-sm border border-gray-200 rounded-lg font-cairo">إلغاء</button>
            <button (click)="submit()" [disabled]="!nameAr.trim()"
                    class="px-4 py-2 text-sm text-white rounded-lg font-cairo font-bold disabled:opacity-50"
                    style="background:hsl(42,80%,45%)">حفظ</button>
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

  nameAr = '';
  managerId = '';
  managerName = '';

  onManagerChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    const emp = this.ds.employees().find(e => e.id === id);
    this.managerId = emp?.id ?? '';
    this.managerName = emp?.nameAr ?? '';
  }

  async submit() {
    if (!this.nameAr.trim()) return;
    await this.ds.addEvent({
      name: this.nameAr,
      nameAr: this.nameAr,
      location: '',
      client: '',
      startDate: '',
      endDate: '',
      status: 'upcoming',
      managerId: this.managerId || undefined,
      managerName: this.managerName || undefined,
    });
    this.closeDialog();
  }

  closeDialog() {
    this.showDialog.set(false);
    this.nameAr = '';
    this.managerId = '';
    this.managerName = '';
  }
}

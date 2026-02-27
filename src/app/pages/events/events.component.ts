import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { ServiceBadgeComponent } from '../../components/service-badge/service-badge.component';
import { EventData } from '../../models/data.models';

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
        <button (click)="openAdd()"
                class="px-4 py-2 rounded-lg text-sm font-cairo font-semibold text-white"
                style="background:hsl(42,80%,45%)">
          + إضافة فعالية
        </button>
      </div>

      <!-- Events List -->
      <div class="space-y-4">
        @for (event of ds.events(); track event.id) {
          <div class="card-glass rounded-xl p-5 animate-fade-in">
            <div class="flex items-start justify-between mb-2">
              <!-- Click area navigates to detail -->
              <div class="flex items-center gap-3 cursor-pointer flex-1"
                   (click)="router.navigate(['/events', event.id])">
                <h2 class="font-cairo font-bold text-lg hover:underline">{{ event.nameAr }}</h2>
                <app-status-badge [status]="event.status"/>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                @if (event.client) {
                  <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-md">{{ event.client }}</span>
                }
                <button (click)="openEdit(event)" title="تعديل"
                        class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm">✏️</button>
              </div>
            </div>

            @if (event.managerName) {
              <p class="text-sm text-gray-500 mb-2 font-cairo cursor-pointer"
                 (click)="router.navigate(['/events', event.id])">
                👤 مدير الفعالية: <span class="text-gray-800 font-medium">{{ event.managerName }}</span>
              </p>
            }
            @if (event.location || event.startDate) {
              <div class="flex items-center gap-6 text-sm text-gray-400 mb-3 cursor-pointer"
                   (click)="router.navigate(['/events', event.id])">
                @if (event.location) { <span>📍 {{ event.location }}</span> }
                @if (event.startDate) { <span>📅 {{ event.startDate }} → {{ event.endDate }}</span> }
              </div>
            }
            @if (event.services.length) {
              <div class="border-t border-gray-100 pt-3 cursor-pointer"
                   (click)="router.navigate(['/events', event.id])">
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

    <!-- Add / Edit Event Dialog -->
    @if (showDialog()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4 my-4" dir="rtl">
          <h2 class="font-cairo font-bold text-lg">{{ editingId() ? 'تعديل بيانات الفعالية' : 'إضافة فعالية جديدة' }}</h2>

          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">اسم الفعالية <span class="text-red-400">*</span></label>
            <input [(ngModel)]="form.nameAr" placeholder="مثال: موسم الرياض 2025" class="input-field w-full"/>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">الموقع</label>
            <input [(ngModel)]="form.location" placeholder="مثال: الرياض" class="input-field w-full"/>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">العميل</label>
            <input [(ngModel)]="form.client" placeholder="مثال: الهيئة العامة للترفيه" class="input-field w-full"/>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-xs text-gray-500 font-cairo">تاريخ البدء</label>
              <input [(ngModel)]="form.startDate" type="date" class="input-field w-full"/>
            </div>
            <div class="space-y-1">
              <label class="text-xs text-gray-500 font-cairo">تاريخ الانتهاء</label>
              <input [(ngModel)]="form.endDate" type="date" class="input-field w-full"/>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">الحالة</label>
            <select [(ngModel)]="form.status" class="input-field w-full">
              <option value="upcoming">قادم</option>
              <option value="active">نشط</option>
              <option value="completed">مكتمل</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">مدير الفعالية</label>
            <select (change)="onManagerChange($event)" class="input-field w-full">
              <option value="">-- بدون مدير --</option>
              @for (emp of ds.employees(); track emp.id) {
                <option [value]="emp.id" [selected]="emp.id === form.managerId">
                  {{ emp.nameAr }} — {{ emp.role }}
                </option>
              }
            </select>
            @if (form.managerName) {
              <p class="text-xs font-cairo" style="color:hsl(42,80%,45%)">✓ {{ form.managerName }}</p>
            }
          </div>

          @if (feedback()) {
            <p class="text-xs font-cairo" [class]="feedbackOk() ? 'text-green-600' : 'text-red-500'">{{ feedback() }}</p>
          }

          <div class="flex gap-3 justify-end pt-1">
            <button (click)="closeDialog()" class="px-4 py-2 text-sm border border-gray-200 rounded-lg font-cairo">إلغاء</button>
            <button (click)="submit()" [disabled]="!form.nameAr.trim() || saving()"
                    class="px-4 py-2 text-sm text-white rounded-lg font-cairo font-bold disabled:opacity-50"
                    style="background:hsl(42,80%,45%)">
              {{ saving() ? 'جاري الحفظ...' : (editingId() ? 'حفظ التعديلات' : 'إضافة') }}
            </button>
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
  editingId  = signal<string | null>(null);
  saving     = signal(false);
  feedback   = signal('');
  feedbackOk = signal(false);

  form = this.emptyForm();

  emptyForm() {
    return { nameAr: '', name: '', location: '', client: '', startDate: '', endDate: '', status: 'upcoming' as 'active'|'completed'|'upcoming', managerId: '', managerName: '' };
  }

  openAdd() {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.feedback.set('');
    this.showDialog.set(true);
  }

  openEdit(event: EventData) {
    this.form = {
      nameAr: event.nameAr, name: event.name,
      location: event.location ?? '', client: event.client ?? '',
      startDate: event.startDate ?? '', endDate: event.endDate ?? '',
      status: event.status, managerId: event.managerId ?? '', managerName: event.managerName ?? '',
    };
    this.editingId.set(event.id);
    this.feedback.set('');
    this.showDialog.set(true);
  }

  onManagerChange(event: Event) {
    const id = (event.target as HTMLSelectElement).value;
    const emp = this.ds.employees().find(e => e.id === id);
    this.form.managerId = emp?.id ?? '';
    this.form.managerName = emp?.nameAr ?? '';
  }

  async submit() {
    if (!this.form.nameAr.trim()) return;
    this.saving.set(true);
    this.feedback.set('');
    try {
      const payload = { ...this.form, name: this.form.name || this.form.nameAr };
      const id = this.editingId();
      if (id) {
        await this.ds.updateEvent(id, payload);
        this.feedback.set('✓ تم حفظ التعديلات');
        this.feedbackOk.set(true);
        setTimeout(() => this.closeDialog(), 800);
      } else {
        await this.ds.addEvent(payload);
        this.closeDialog();
      }
    } catch {
      this.feedback.set('حدث خطأ أثناء الحفظ');
      this.feedbackOk.set(false);
    } finally {
      this.saving.set(false);
    }
  }

  closeDialog() {
    this.showDialog.set(false);
    this.editingId.set(null);
    this.form = this.emptyForm();
    this.feedback.set('');
  }
}

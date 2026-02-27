import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';
import { LangService } from '../../services/lang.service';
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
          <h1 class="text-2xl font-cairo font-bold">{{ lang.t('الفعاليات', 'Events') }}</h1>
          <p class="text-gray-500 text-sm mt-1">{{ lang.t('اضغط على الفعالية لعرض الموظفين وتقييمهم', 'Click an event to view staff and evaluations') }}</p>
        </div>
        <button (click)="openAdd()"
                class="px-4 py-2 rounded-lg text-sm font-cairo font-semibold text-white"
                style="background:hsl(42,80%,45%)">
          + {{ lang.t('إضافة فعالية', 'Add Event') }}
        </button>
      </div>

      <!-- Events List -->
      <div class="space-y-4">
        @for (event of ds.events(); track event.id) {
          <div class="card-glass rounded-xl p-5 animate-fade-in">
            <div class="flex items-start justify-between mb-2">
              <div class="flex items-center gap-3 cursor-pointer flex-1"
                   (click)="router.navigate(['/events', event.id])">
                <h2 class="font-cairo font-bold text-lg hover:underline">{{ lang.isAr ? event.nameAr : event.name }}</h2>
                <app-status-badge [status]="event.status"/>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                @if (event.client) {
                  <span class="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-md">{{ event.client }}</span>
                }
                <button (click)="openEdit(event)"
                        class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                        [title]="lang.t('تعديل', 'Edit')">✏️</button>
              </div>
            </div>

            @if (event.managerName) {
              <p class="text-sm text-gray-500 mb-2 font-cairo cursor-pointer"
                 (click)="router.navigate(['/events', event.id])">
                👤 {{ lang.t('مدير الفعالية', 'Event Manager') }}: <span class="text-gray-800 font-medium">{{ event.managerName }}</span>
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
                <p class="font-cairo font-semibold text-sm mb-2 text-gray-600">
                  {{ lang.t('الخدمات', 'Services') }} ({{ event.services.length }})
                </p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  @for (s of event.services; track s.id) {
                    <div class="bg-gray-50 rounded-lg p-3 space-y-1">
                      <app-service-badge [type]="s.type"/>
                      <p class="text-xs text-gray-400">{{ lang.t('مدير المشروع', 'Project Manager') }}: <span class="text-gray-700">{{ s.projectManagerName }}</span></p>
                      <p class="text-xs text-gray-400">{{ lang.t('عدد الموظفين', 'Staff Count') }}: <span class="text-gray-700">{{ s.employeeIds.length }}</span></p>
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
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4 my-4" [attr.dir]="lang.isAr ? 'rtl' : 'ltr'">
          <h2 class="font-cairo font-bold text-lg">
            {{ editingId() ? lang.t('تعديل بيانات الفعالية', 'Edit Event') : lang.t('إضافة فعالية جديدة', 'Add New Event') }}
          </h2>

          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">{{ lang.t('اسم الفعالية', 'Event Name') }} <span class="text-red-400">*</span></label>
            <input [(ngModel)]="form.nameAr" [placeholder]="lang.t('مثال: موسم الرياض 2025', 'e.g. Riyadh Season 2025')" class="input-field w-full"/>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">{{ lang.t('الموقع', 'Location') }}</label>
            <input [(ngModel)]="form.location" [placeholder]="lang.t('مثال: الرياض', 'e.g. Riyadh')" class="input-field w-full"/>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">{{ lang.t('العميل', 'Client') }}</label>
            <input [(ngModel)]="form.client" [placeholder]="lang.t('مثال: الهيئة العامة للترفيه', 'e.g. General Entertainment Authority')" class="input-field w-full"/>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="text-xs text-gray-500 font-cairo">{{ lang.t('تاريخ البدء', 'Start Date') }}</label>
              <input [(ngModel)]="form.startDate" type="date" class="input-field w-full"/>
            </div>
            <div class="space-y-1">
              <label class="text-xs text-gray-500 font-cairo">{{ lang.t('تاريخ الانتهاء', 'End Date') }}</label>
              <input [(ngModel)]="form.endDate" type="date" class="input-field w-full"/>
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">{{ lang.t('الحالة', 'Status') }}</label>
            <select [(ngModel)]="form.status" class="input-field w-full">
              <option value="upcoming">{{ lang.t('قادم', 'Upcoming') }}</option>
              <option value="active">{{ lang.t('نشط', 'Active') }}</option>
              <option value="completed">{{ lang.t('مكتمل', 'Completed') }}</option>
            </select>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">{{ lang.t('مدير الفعالية', 'Event Manager') }}</label>
            <select (change)="onManagerChange($event)" class="input-field w-full">
              <option value="">-- {{ lang.t('بدون مدير', 'No manager') }} --</option>
              @for (emp of ds.employees(); track emp.id) {
                <option [value]="emp.id" [selected]="emp.id === form.managerId">
                  {{ lang.isAr ? emp.nameAr : emp.name }} — {{ emp.role }}
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
            <button (click)="closeDialog()" class="px-4 py-2 text-sm border border-gray-200 rounded-lg font-cairo">
              {{ lang.t('إلغاء', 'Cancel') }}
            </button>
            <button (click)="submit()" [disabled]="!form.nameAr.trim() || saving()"
                    class="px-4 py-2 text-sm text-white rounded-lg font-cairo font-bold disabled:opacity-50"
                    style="background:hsl(42,80%,45%)">
              {{ saving() ? lang.t('جاري الحفظ...', 'Saving...') : (editingId() ? lang.t('حفظ التعديلات', 'Save Changes') : lang.t('إضافة', 'Add')) }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`.input-field { border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; font-family:'Cairo',sans-serif; outline:none; width:100%; } .input-field:focus { border-color:hsl(42,80%,45%); }`]
})
export class EventsComponent {
  ds     = inject(DataService);
  router = inject(Router);
  lang   = inject(LangService);

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
        this.feedback.set(this.lang.t('✓ تم حفظ التعديلات', '✓ Changes saved'));
        this.feedbackOk.set(true);
        setTimeout(() => this.closeDialog(), 800);
      } else {
        await this.ds.addEvent(payload);
        this.closeDialog();
      }
    } catch {
      this.feedback.set(this.lang.t('حدث خطأ أثناء الحفظ', 'Error saving changes'));
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

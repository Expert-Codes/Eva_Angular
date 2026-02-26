import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { ServiceBadgeComponent } from '../../components/service-badge/service-badge.component';
import { RatingStarsComponent } from '../../components/rating-stars/rating-stars.component';
import { CRITERIA_LABELS, ServiceType } from '../../models/data.models';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StatusBadgeComponent, ServiceBadgeComponent, RatingStarsComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/events" class="text-gray-400 hover:text-gray-600">← الفعاليات</a>
      </div>

      @if (event()) {
        <div class="card-glass rounded-xl p-5">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="flex items-center gap-3 mb-1">
                <h1 class="text-2xl font-cairo font-bold">{{ event()!.nameAr }}</h1>
                <app-status-badge [status]="event()!.status"/>
              </div>
              <p class="text-gray-400">{{ event()!.name }}</p>
            </div>
            <span class="text-xs bg-gray-100 px-3 py-1 rounded-md text-gray-500">{{ event()!.client }}</span>
          </div>
          <div class="flex gap-6 text-sm text-gray-400">
            <span>📍 {{ event()!.location }}</span>
            <span>📅 {{ event()!.startDate }} → {{ event()!.endDate }}</span>
            <span *ngIf="event()!.managerName">👤 مدير الفعالية: {{ event()!.managerName }}</span>
          </div>
        </div>

        @for (service of event()!.services; track service.id) {
          <div class="card-glass rounded-xl p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <app-service-badge [type]="service.type"/>
                <app-status-badge [status]="service.status"/>
              </div>
              <p class="text-sm text-gray-400 font-cairo">مدير المشروع: <span class="text-gray-700 font-medium">{{ service.projectManagerName }}</span></p>
            </div>

            <div class="space-y-3">
              @for (empId of service.employeeIds; track empId) {
                @if (getEmployee(empId)) {
                  <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                           style="background:hsl(42,80%,45%,0.15); color:hsl(42,80%,45%)">{{ getEmployee(empId)!.avatar }}</div>
                      <div>
                        <p class="font-cairo font-semibold text-sm">{{ getEmployee(empId)!.nameAr }}</p>
                        <p class="text-xs text-gray-400">{{ getEmployee(empId)!.role }}</p>
                      </div>
                    </div>
                    @if (getEvaluation(empId, service.type)) {
                      <app-rating-stars [rating]="getEvaluation(empId, service.type)!.overallRating" size="sm"/>
                    } @else {
                      <button (click)="startEval(empId, service.type)"
                              class="px-3 py-1.5 text-xs text-white rounded-lg font-cairo font-semibold" style="background:hsl(42,80%,45%)">
                        ⭐ تقييم
                      </button>
                    }
                  </div>
                }
              }
            </div>
          </div>
        }

        @if (evalTarget()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div class="bg-white rounded-xl p-6 w-full max-w-2xl space-y-4 my-4" dir="rtl">
              <h2 class="font-cairo font-bold text-lg">إضافة تقييم</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                @for (key of criteriaKeys; track key) {
                  <div class="space-y-1">
                    <label class="text-xs text-gray-500 font-cairo">{{ criteriaLabels[key]?.ar }}</label>
                    <input type="number" min="1" max="5" [(ngModel)]="evalForm[key]" class="input-field w-full"/>
                  </div>
                }
              </div>
              <textarea [(ngModel)]="evalNotes" placeholder="ملاحظات..." rows="2" class="input-field w-full resize-none"></textarea>
              <div class="flex gap-3 justify-end">
                <button (click)="evalTarget.set(null)" class="px-4 py-2 text-sm border border-gray-200 rounded-lg font-cairo">إلغاء</button>
                <button (click)="submitEval()" class="px-4 py-2 text-sm text-white rounded-lg font-cairo font-bold" style="background:hsl(42,80%,45%)">حفظ</button>
              </div>
            </div>
          </div>
        }
      } @else {
        <p class="text-gray-400 font-cairo text-center py-12">الفعالية غير موجودة</p>
      }
    </div>
  `,
  styles: [`.input-field { border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; font-family:'Cairo',sans-serif; outline:none; width:100%; } .input-field:focus { border-color:hsl(42,80%,45%); }`]
})
export class EventDetailComponent {
  ds = inject(DataService);
  route = inject(ActivatedRoute);
  eventId = this.route.snapshot.paramMap.get('id') ?? '';
  event = computed(() => this.ds.events().find(e => e.id === this.eventId));

  evalTarget = signal<{ employeeId: string; serviceType: ServiceType } | null>(null);
  evalNotes = '';
  evalForm: any = { creativity:4, workQuality:4, teamwork:4, efficiency:4, accuracy:4, punctuality:4, organization:4, planning:4, independence:4, responsibility:4, leadership:4, appearance:4, assetCare:4 };
  criteriaKeys = Object.keys(CRITERIA_LABELS);
  criteriaLabels = CRITERIA_LABELS;

  getEmployee(id: string) { return this.ds.employees().find(e => e.id === id); }
  getEvaluation(empId: string, serviceType: string) {
    return this.ds.evaluations().find(ev => ev.eventId === this.eventId && ev.employeeId === empId && ev.serviceType === serviceType);
  }

  startEval(employeeId: string, serviceType: ServiceType) { this.evalTarget.set({ employeeId, serviceType }); }

  async submitEval() {
    const t = this.evalTarget();
    if (!t) return;
    const emp = this.getEmployee(t.employeeId);
    const evt = this.event();
    if (!emp || !evt) return;
    const total = Object.values(this.evalForm).reduce((a: number, v) => a + Number(v), 0);
    await this.ds.addEvaluation({
      id: '', eventId: this.eventId, eventName: evt.nameAr,
      serviceType: t.serviceType, employeeId: t.employeeId, employeeName: emp.nameAr,
      evaluatorId: 'e1', evaluatorName: 'مدير', date: new Date().toISOString().slice(0,10),
      criteria: { ...this.evalForm }, overallRating: Math.round((total / this.criteriaKeys.length) * 10) / 10, notes: this.evalNotes,
    });
    this.evalTarget.set(null);
    this.evalNotes = '';
  }
}

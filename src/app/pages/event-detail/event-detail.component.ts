import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { LangService } from '../../services/lang.service';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { ServiceBadgeComponent } from '../../components/service-badge/service-badge.component';
import { RatingStarsComponent } from '../../components/rating-stars/rating-stars.component';
import { CRITERIA_LABELS, ServiceType, EventService } from '../../models/data.models';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StatusBadgeComponent, ServiceBadgeComponent, RatingStarsComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center gap-3">
        <a routerLink="/events" class="text-gray-400 hover:text-gray-600">← {{ lang.t('الفعاليات', 'Events') }}</a>
      </div>

      @if (event()) {
        <!-- Event Header -->
        <div class="card-glass rounded-xl p-5">
          <div class="flex items-start justify-between mb-4">
            <div>
              <div class="flex items-center gap-3 mb-1">
                <h1 class="text-2xl font-cairo font-bold">{{ lang.isAr ? event()!.nameAr : event()!.name }}</h1>
                <app-status-badge [status]="event()!.status"/>
              </div>
              <p class="text-gray-400">{{ lang.isAr ? event()!.name : event()!.nameAr }}</p>
            </div>
            <span class="text-xs bg-gray-100 px-3 py-1 rounded-md text-gray-500">{{ event()!.client }}</span>
          </div>
          <div class="flex flex-wrap gap-6 text-sm text-gray-400">
            @if (event()!.location) { <span>📍 {{ event()!.location }}</span> }
            @if (event()!.startDate) { <span>📅 {{ event()!.startDate }} → {{ event()!.endDate }}</span> }
          </div>

          <!-- Event Manager row with send-link button -->
          @if (event()!.managerId) {
            <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <p class="text-sm text-gray-500 font-cairo">
                👤 {{ lang.t('مدير الفعالية', 'Event Manager') }}:
                <span class="text-gray-800 font-semibold">{{ event()!.managerName }}</span>
              </p>
              <button (click)="generateLink(event()!.managerId!, event()!.managerName!)"
                      [disabled]="generating() === event()!.managerId"
                      class="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all font-cairo"
                      style="border-color:hsl(210,80%,55%); color:hsl(210,80%,45%)">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
                {{ generating() === event()!.managerId ? lang.t('جاري الإنشاء...', 'Generating...') : lang.t('رابط التقييم', 'Evaluation Link') }}
              </button>
            </div>
          }
        </div>

        <!-- Services -->
        @for (service of event()!.services; track service.id) {
          <div class="card-glass rounded-xl overflow-hidden">

            <!-- Service Header -->
            <div class="p-5 border-b border-gray-100">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <app-service-badge [type]="service.type"/>
                  <app-status-badge [status]="service.status"/>
                </div>
                <!-- Project manager + send-link button -->
                <div class="flex items-center gap-3">
                  <p class="text-sm text-gray-400 font-cairo">
                    {{ lang.t('مدير المشروع', 'Project Manager') }}:
                    <span class="text-gray-700 font-medium">{{ service.projectManagerName }}</span>
                  </p>
                  @if (service.projectManagerId) {
                    <button (click)="generateLink(service.projectManagerId, service.projectManagerName)"
                            [disabled]="generating() === service.projectManagerId"
                            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all font-cairo shrink-0"
                            style="border-color:hsl(210,80%,55%); color:hsl(210,80%,45%)">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                      </svg>
                      {{ generating() === service.projectManagerId ? lang.t('جاري...', 'Wait...') : lang.t('رابط التقييم', 'Eval Link') }}
                    </button>
                  }
                </div>
              </div>

              <!-- Summary Stats -->
              <div class="grid grid-cols-3 gap-3">
                <div class="rounded-lg p-3 text-center" style="background:hsl(42,80%,45%,0.08)">
                  <p class="text-2xl font-cairo font-bold" style="color:hsl(42,80%,45%)">{{ service.employeeIds.length }}</p>
                  <p class="text-xs text-gray-500 font-cairo mt-1">{{ lang.t('إجمالي الموظفين', 'Total Staff') }}</p>
                </div>
                <div class="rounded-lg p-3 text-center" style="background:hsl(150,60%,40%,0.08)">
                  <p class="text-2xl font-cairo font-bold" style="color:hsl(150,60%,40%)">{{ getEvaluatedCount(service) }}</p>
                  <p class="text-xs text-gray-500 font-cairo mt-1">{{ lang.t('تم تقييمهم', 'Evaluated') }}</p>
                </div>
                <div class="rounded-lg p-3 text-center" style="background:hsl(220,80%,55%,0.08)">
                  <p class="text-2xl font-cairo font-bold" style="color:hsl(220,80%,55%)">
                    {{ getServiceAvgRating(service) > 0 ? getServiceAvgRating(service) : '—' }}
                  </p>
                  <p class="text-xs text-gray-500 font-cairo mt-1">{{ lang.t('متوسط التقييم', 'Avg Rating') }}</p>
                </div>
              </div>

              <!-- Progress bar -->
              @if (service.employeeIds.length > 0) {
                <div class="mt-4 space-y-1">
                  <div class="flex justify-between text-xs text-gray-400 font-cairo">
                    <span>{{ lang.t('نسبة التقييم', 'Evaluation Progress') }}</span>
                    <span>{{ getEvaluatedCount(service) }}/{{ service.employeeIds.length }}</span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2">
                    <div class="h-2 rounded-full transition-all duration-500"
                         style="background:hsl(42,80%,45%); width:{{ getEvalPercent(service) }}%"></div>
                  </div>
                </div>
              }
            </div>

            <!-- Employee List -->
            <div class="p-5 space-y-3">
              <p class="font-cairo font-semibold text-sm text-gray-600 mb-3">{{ lang.t('الموظفون', 'Staff') }}</p>
              @for (empId of service.employeeIds; track empId) {
                @if (getEmployee(empId)) {
                  <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                           style="background:hsl(42,80%,45%,0.15); color:hsl(42,80%,45%)">{{ getEmployee(empId)!.avatar }}</div>
                      <div>
                        <p class="font-cairo font-semibold text-sm">{{ lang.isAr ? getEmployee(empId)!.nameAr : getEmployee(empId)!.name }}</p>
                        <p class="text-xs text-gray-400">{{ getEmployee(empId)!.role }}</p>
                      </div>
                    </div>
                    @if (getEvaluation(empId, service.type)) {
                      <div class="flex items-center gap-2">
                        <app-rating-stars [rating]="getEvaluation(empId, service.type)!.overallRating" size="sm"/>
                        <span class="text-xs text-gray-400 font-cairo">{{ getEvaluation(empId, service.type)!.overallRating }}/5</span>
                      </div>
                    } @else {
                      <button (click)="startEval(empId, service.type)"
                              class="px-3 py-1.5 text-xs text-white rounded-lg font-cairo font-semibold" style="background:hsl(42,80%,45%)">
                        ⭐ {{ lang.t('تقييم', 'Evaluate') }}
                      </button>
                    }
                  </div>
                }
              }
            </div>
          </div>
        }

        <!-- Evaluation Dialog -->
        @if (evalTarget()) {
          <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
            <div class="bg-white rounded-xl p-6 w-full max-w-2xl space-y-4 my-4" [attr.dir]="lang.isAr ? 'rtl' : 'ltr'">
              <h2 class="font-cairo font-bold text-lg">{{ lang.t('إضافة تقييم', 'Add Evaluation') }}</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                @for (key of criteriaKeys; track key) {
                  <div class="space-y-1">
                    <label class="text-xs text-gray-500 font-cairo">{{ lang.isAr ? criteriaLabels[key]?.ar : criteriaLabels[key]?.en }}</label>
                    <input type="number" min="1" max="5" [(ngModel)]="evalForm[key]" class="input-field w-full"/>
                  </div>
                }
              </div>
              <textarea [(ngModel)]="evalNotes" [placeholder]="lang.t('ملاحظات...', 'Notes...')" rows="2" class="input-field w-full resize-none"></textarea>
              <div class="flex gap-3 justify-end">
                <button (click)="evalTarget.set(null)" class="px-4 py-2 text-sm border border-gray-200 rounded-lg font-cairo">{{ lang.t('إلغاء', 'Cancel') }}</button>
                <button (click)="submitEval()" class="px-4 py-2 text-sm text-white rounded-lg font-cairo font-bold" style="background:hsl(42,80%,45%)">{{ lang.t('حفظ', 'Save') }}</button>
              </div>
            </div>
          </div>
        }

        <!-- Link Modal -->
        @if (linkModal()) {
          <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4" [attr.dir]="lang.isAr ? 'rtl' : 'ltr'">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">✓</div>
                <div>
                  <h3 class="font-cairo font-bold text-gray-800">{{ lang.t('رابط التقييم جاهز', 'Evaluation Link Ready') }}</h3>
                  <p class="text-xs text-gray-400 font-cairo">
                    {{ lang.t('لـ', 'For') }}: <span class="font-semibold text-gray-700">{{ linkForName() }}</span>
                    · {{ lang.t('صالح لمدة 7 أيام', 'Valid for 7 days') }}
                  </p>
                </div>
              </div>

              <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                <p class="text-xs text-gray-400 font-cairo">{{ lang.t('انسخ الرابط وأرسله للمدير', 'Copy and share this link with the manager') }}</p>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-blue-700 break-all flex-1 select-all font-mono bg-blue-50 p-2 rounded-lg">{{ linkModal() }}</span>
                  <button (click)="copyLink()"
                          class="shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition-colors font-cairo"
                          [style]="copied() ? 'background:#16a34a;color:white' : 'background:hsl(42,80%,45%);color:white'">
                    {{ copied() ? lang.t('تم النسخ ✓', 'Copied ✓') : lang.t('نسخ', 'Copy') }}
                  </button>
                </div>
              </div>

              <button (click)="closeLinkModal()"
                      class="w-full py-2 rounded-xl font-cairo font-semibold text-white text-sm"
                      style="background:hsl(42,80%,45%)">
                {{ lang.t('إغلاق', 'Close') }}
              </button>
            </div>
          </div>
        }

      } @else {
        <p class="text-gray-400 font-cairo text-center py-12">{{ lang.t('الفعالية غير موجودة', 'Event not found') }}</p>
      }
    </div>
  `,
  styles: [`.input-field { border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; font-family:'Cairo',sans-serif; outline:none; width:100%; } .input-field:focus { border-color:hsl(42,80%,45%); }`]
})
export class EventDetailComponent {
  ds   = inject(DataService);
  lang = inject(LangService);
  route = inject(ActivatedRoute);
  eventId = this.route.snapshot.paramMap.get('id') ?? '';
  event = computed(() => this.ds.events().find(e => e.id === this.eventId));

  // Eval form
  evalTarget = signal<{ employeeId: string; serviceType: ServiceType } | null>(null);
  evalNotes = '';
  evalForm: any = { creativity:4, workQuality:4, teamwork:4, efficiency:4, accuracy:4, punctuality:4, organization:4, planning:4, independence:4, responsibility:4, leadership:4, appearance:4, assetCare:4 };
  criteriaKeys = Object.keys(CRITERIA_LABELS);
  criteriaLabels = CRITERIA_LABELS;

  // Link modal
  linkModal   = signal<string | null>(null);
  linkForName = signal('');
  generating  = signal<string | null>(null);
  copied      = signal(false);

  getEmployee(id: string) { return this.ds.employees().find(e => e.id === id); }

  getEvaluation(empId: string, serviceType: string) {
    return this.ds.evaluations().find(ev => ev.eventId === this.eventId && ev.employeeId === empId && ev.serviceType === serviceType);
  }

  getEvaluatedCount(service: EventService): number {
    return service.employeeIds.filter(id => this.getEvaluation(id, service.type)).length;
  }

  getServiceAvgRating(service: EventService): number {
    const evals = service.employeeIds
      .map(id => this.getEvaluation(id, service.type))
      .filter(ev => ev != null);
    if (!evals.length) return 0;
    return Math.round((evals.reduce((sum, ev) => sum + ev!.overallRating, 0) / evals.length) * 10) / 10;
  }

  getEvalPercent(service: EventService): number {
    if (!service.employeeIds.length) return 0;
    return Math.round((this.getEvaluatedCount(service) / service.employeeIds.length) * 100);
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

  async generateLink(managerId: string, managerName: string) {
    this.generating.set(managerId);
    try {
      const res = await this.ds.resendToken(managerId);
      const link = `${window.location.origin}/access/${res.token}`;
      this.linkForName.set(managerName);
      this.linkModal.set(link);
      this.copied.set(false);
    } catch {
      alert(this.lang.t('حدث خطأ أثناء إنشاء الرابط', 'Failed to generate link'));
    } finally {
      this.generating.set(null);
    }
  }

  copyLink() {
    const link = this.linkModal();
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  closeLinkModal() { this.linkModal.set(null); }
}

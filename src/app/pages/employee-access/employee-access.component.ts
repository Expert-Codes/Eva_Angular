import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TokenAccess, EventData, EventService, Employee, CRITERIA_LABELS } from '../../models/data.models';

@Component({
  selector: 'app-employee-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-4" dir="rtl">

      @if (loading()) {
        <div class="flex items-center justify-center min-h-screen">
          <p class="font-cairo text-gray-400 text-lg">جاري التحقق من الرابط...</p>
        </div>
      }

      @if (errorMsg()) {
        <div class="flex items-center justify-center min-h-screen">
          <div class="bg-white rounded-xl p-8 text-center shadow max-w-sm">
            <div class="text-4xl mb-4">⛔</div>
            <p class="font-cairo font-bold text-gray-800 text-lg">{{ errorMsg() }}</p>
            <p class="text-sm text-gray-400 font-cairo mt-2">يرجى التواصل مع المدير للحصول على رابط جديد.</p>
          </div>
        </div>
      }

      @if (done()) {
        <div class="flex items-center justify-center min-h-screen">
          <div class="bg-white rounded-xl p-8 text-center shadow max-w-sm">
            <div class="text-5xl mb-4">✅</div>
            <h2 class="font-cairo font-bold text-gray-800 text-xl mb-2">تم حفظ التقييمات بنجاح!</h2>
            <p class="text-gray-400 font-cairo text-sm">شكراً لك. تم تسجيل تقييماتك وانتهت صلاحية هذا الرابط.</p>
          </div>
        </div>
      }

      @if (access() && !loading() && !errorMsg() && !done()) {
        <div class="max-w-3xl mx-auto space-y-6 py-6">

          <!-- Header -->
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                   style="background: hsl(42,80%,45%,0.12); color: hsl(42,80%,45%)">
                {{ access()!.employee.avatar }}
              </div>
              <div>
                <h1 class="font-cairo font-bold text-lg">مرحباً، {{ access()!.employee.nameAr }}</h1>
                <p class="text-sm text-gray-400 font-cairo">{{ access()!.employee.role }}</p>
              </div>
            </div>
            <p class="text-xs text-gray-400 font-cairo mt-3">
              صلاحية الرابط تنتهي: {{ access()!.expiresAt | date:'yyyy-MM-dd HH:mm' }}
            </p>
          </div>

          <!-- Events & Services -->
          @for (event of access()!.events; track event.id) {
            @for (service of getMyServices(event); track service.id) {
              <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                <!-- Service Header -->
                <div class="p-4 border-b border-gray-100" style="background: hsl(42,80%,45%,0.04)">
                  <h2 class="font-cairo font-bold">{{ event.nameAr }}</h2>
                  <p class="text-sm text-gray-500 font-cairo mt-0.5">{{ service.type }}</p>
                </div>

                <!-- Employee List to Evaluate -->
                <div class="p-4 space-y-4">
                  <p class="font-cairo font-semibold text-sm text-gray-600">قيّم فريقك</p>

                  @for (empId of service.employeeIds; track empId) {
                    @if (empId !== access()!.employee.id) {
                      <div class="border border-gray-100 rounded-xl p-4 space-y-3">
                        <div class="flex items-center justify-between">
                          <p class="font-cairo font-semibold text-sm">موظف: {{ empId }}</p>
                          @if (isEvaluated(event.id, service.id, empId)) {
                            <span class="text-xs text-green-600 font-cairo bg-green-50 px-2 py-0.5 rounded-full">✓ تم التقييم</span>
                          }
                        </div>

                        @if (!isEvaluated(event.id, service.id, empId)) {
                          <div class="grid grid-cols-2 gap-2">
                            @for (key of criteriaKeys; track key) {
                              <div class="space-y-0.5">
                                <label class="text-xs text-gray-400 font-cairo">{{ criteriaLabels[key]?.ar }}</label>
                                <input type="number" min="1" max="5"
                                       [value]="getForm(event.id, service.id, empId)[key]"
                                       (input)="setForm(event.id, service.id, empId, key, $event)"
                                       class="input-field w-full text-sm"/>
                              </div>
                            }
                          </div>
                          <textarea [value]="getNotes(event.id, service.id, empId)"
                                    (input)="setNotes(event.id, service.id, empId, $event)"
                                    placeholder="ملاحظات..." rows="2"
                                    class="input-field w-full resize-none text-sm"></textarea>
                          <button (click)="saveEval(event, service, empId)"
                                  class="px-4 py-1.5 text-xs text-white rounded-lg font-cairo font-bold"
                                  style="background: hsl(42,80%,45%)">
                            حفظ التقييم
                          </button>
                        }
                      </div>
                    }
                  }
                </div>
              </div>
            }
          }

          <!-- Submit All -->
          <div class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            @if (submitError()) {
              <p class="text-sm text-red-500 font-cairo mb-3">{{ submitError() }}</p>
            }
            <button (click)="submitAll()" [disabled]="submitting()"
                    class="w-full py-3 rounded-xl text-white font-cairo font-bold disabled:opacity-50"
                    style="background: hsl(42,80%,45%)">
              {{ submitting() ? 'جاري الإرسال...' : 'إرسال جميع التقييمات وإنهاء الجلسة' }}
            </button>
          </div>

        </div>
      }

    </div>
  `,
  styles: [`.input-field { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.5rem 0.6rem; font-family: 'Cairo', sans-serif; outline: none; width: 100%; } .input-field:focus { border-color: hsl(42,80%,45%); }`]
})
export class EmployeeAccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private readonly BASE = 'http://localhost:3000/api';

  token = '';
  access = signal<TokenAccess | null>(null);
  loading = signal(true);
  errorMsg = signal('');
  done = signal(false);
  submitting = signal(false);
  submitError = signal('');

  criteriaKeys = Object.keys(CRITERIA_LABELS);
  criteriaLabels = CRITERIA_LABELS;

  // Store pending evaluations: key = "eventId|serviceId|empId"
  private forms: Record<string, Record<string, number>> = {};
  private notes: Record<string, string> = {};
  private evaluated = new Set<string>();

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    this.loadAccess();
  }

  async loadAccess() {
    try {
      const data = await firstValueFrom(
        this.http.get<TokenAccess>(`${this.BASE}/access/${this.token}`)
      );
      this.access.set(data);
    } catch (err: any) {
      this.errorMsg.set(err?.error?.message ?? 'الرابط غير صالح أو منتهي الصلاحية');
    } finally {
      this.loading.set(false);
    }
  }

  getMyServices(event: EventData): EventService[] {
    const empId = this.access()!.employee.id;
    return event.services.filter(s =>
      s.projectManagerId === empId || s.employeeIds.includes(empId)
    );
  }

  private formKey(eventId: string, serviceId: string, empId: string) {
    return `${eventId}|${serviceId}|${empId}`;
  }

  getForm(eventId: string, serviceId: string, empId: string): Record<string, number> {
    const key = this.formKey(eventId, serviceId, empId);
    if (!this.forms[key]) {
      this.forms[key] = {};
      this.criteriaKeys.forEach(k => this.forms[key][k] = 4);
    }
    return this.forms[key];
  }

  setForm(eventId: string, serviceId: string, empId: string, field: string, event: Event) {
    const val = Number((event.target as HTMLInputElement).value);
    this.getForm(eventId, serviceId, empId)[field] = Math.min(5, Math.max(1, val));
  }

  getNotes(eventId: string, serviceId: string, empId: string): string {
    return this.notes[this.formKey(eventId, serviceId, empId)] ?? '';
  }

  setNotes(eventId: string, serviceId: string, empId: string, event: Event) {
    this.notes[this.formKey(eventId, serviceId, empId)] = (event.target as HTMLTextAreaElement).value;
  }

  isEvaluated(eventId: string, serviceId: string, empId: string): boolean {
    return this.evaluated.has(this.formKey(eventId, serviceId, empId));
  }

  saveEval(event: EventData, service: EventService, empId: string) {
    this.evaluated.add(this.formKey(event.id, service.id, empId));
  }

  async submitAll() {
    const data = this.access();
    if (!data) return;

    const evaluations: any[] = [];
    for (const event of data.events) {
      for (const service of this.getMyServices(event)) {
        for (const empId of service.employeeIds) {
          if (empId === data.employee.id) continue;
          if (!this.isEvaluated(event.id, service.id, empId)) continue;
          const form = this.getForm(event.id, service.id, empId);
          const total = Object.values(form).reduce((a, v) => a + v, 0);
          evaluations.push({
            eventId: event.id,
            eventName: event.nameAr,
            serviceType: service.type,
            employeeId: empId,
            employeeName: empId,
            evaluatorId: data.employee.id,
            evaluatorName: data.employee.nameAr,
            date: new Date().toISOString().slice(0, 10),
            criteria: form,
            overallRating: Math.round((total / this.criteriaKeys.length) * 10) / 10,
            notes: this.getNotes(event.id, service.id, empId),
          });
        }
      }
    }

    if (!evaluations.length) {
      this.submitError.set('لم يتم حفظ أي تقييم بعد. يرجى تقييم أحد الموظفين أولاً.');
      return;
    }

    this.submitting.set(true);
    try {
      await firstValueFrom(
        this.http.post(`${this.BASE}/access/${this.token}/evaluate`, evaluations)
      );
      this.done.set(true);
    } catch (err: any) {
      this.submitError.set(err?.error?.message ?? 'حدث خطأ أثناء الإرسال');
    } finally {
      this.submitting.set(false);
    }
  }
}

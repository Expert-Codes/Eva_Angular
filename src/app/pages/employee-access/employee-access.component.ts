import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TokenAccess, Employee, Evaluation, CRITERIA_LABELS } from '../../models/data.models';

interface EvalEntry {
  employee: Employee;
  eventId: string;
  eventName: string;
  serviceId: string;
  serviceType: string;
  form: Record<string, number>;
  notes: string;
  saved: boolean;
}

@Component({
  selector: 'app-employee-access',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen p-4" style="background:#f8f7f5">

      @if (loading()) {
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center space-y-3">
            <div class="w-10 h-10 border-4 rounded-full mx-auto animate-spin"
                 style="border-color:hsl(42,80%,45%); border-top-color:transparent"></div>
            <p class="text-gray-400">Verifying link...</p>
          </div>
        </div>
      }

      @if (errorMsg()) {
        <div class="flex items-center justify-center min-h-screen">
          <div class="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
            <div class="text-5xl mb-4">⛔</div>
            <p class="font-bold text-gray-800 text-lg">{{ errorMsg() }}</p>
            <p class="text-sm text-gray-400 mt-2">Please contact your administrator for a new link.</p>
          </div>
        </div>
      }

      @if (access() && !loading() && !errorMsg()) {
        <div class="max-w-3xl mx-auto space-y-5 py-6">

          <!-- Manager header (always visible) -->
          <div class="bg-white rounded-2xl p-5 shadow-sm" dir="rtl">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shrink-0"
                   style="background:hsl(42,80%,45%,0.12); color:hsl(42,80%,45%)">
                {{ access()!.employee.avatar }}
              </div>
              <div>
                <h1 class="font-cairo font-bold text-lg text-gray-800">{{ access()!.employee.nameAr || access()!.employee.name }}</h1>
                <p class="text-sm text-gray-400 font-cairo">{{ access()!.employee.role }}</p>
              </div>
              @if (phase() !== 'results') {
                <div class="me-auto flex items-center gap-1.5">
                  <span class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                        [style]="phase() === 'select' ? 'background:hsl(42,80%,45%);color:white' : 'background:#e5e7eb;color:#6b7280'">1</span>
                  <div class="w-5 h-0.5 bg-gray-200"></div>
                  <span class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                        [style]="phase() !== 'select' ? 'background:hsl(42,80%,45%);color:white' : 'background:#e5e7eb;color:#6b7280'">2</span>
                </div>
              }
            </div>
            <p class="text-xs text-gray-400 mt-3">🕒 {{ access()!.expiresAt | date:'MMM d, y — HH:mm' }}</p>
          </div>

          <!-- ══════════════════════════════════════════════════════ -->
          <!-- STEP 1 — Two-zone employee picker                     -->
          <!-- ══════════════════════════════════════════════════════ -->
          @if (phase() === 'select') {
            <div class="bg-white rounded-2xl shadow-sm overflow-hidden" dir="rtl">
              <!-- Selected -->
              <div class="px-5 pt-5 pb-3">
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-lg leading-none">👥</span>
                  <span class="font-cairo font-semibold text-gray-700 text-sm">الموظفون</span>
                  <span class="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white"
                        style="background:hsl(42,80%,45%)">{{ selected().size }}</span>
                </div>
                @if (selected().size === 0) {
                  <p class="text-xs text-gray-300 font-cairo text-center py-4">لم يتم اختيار أي موظف بعد</p>
                } @else {
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    @for (emp of selectedEmployees(); track emp.id) {
                      <div class="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 hover:border-red-200 transition-colors">
                        <button (click)="toggleSelect(emp.id)"
                                class="text-gray-300 hover:text-red-400 transition-colors font-bold text-base leading-none shrink-0 me-auto">×</button>
                        <div class="text-right min-w-0">
                          <p class="font-cairo font-semibold text-sm text-gray-800 truncate">{{ emp.nameAr || emp.name }}</p>
                          <p class="font-cairo text-xs text-gray-400 truncate">{{ emp.role }}</p>
                        </div>
                        <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                             style="background:hsl(42,80%,45%,0.15); color:hsl(42,80%,45%)">{{ emp.avatar }}</div>
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="border-t border-gray-100 mx-5"></div>

              <!-- Available -->
              <div class="px-5 pt-3 pb-5">
                <p class="font-cairo text-xs text-gray-400 mb-3">اختر موظفاً لإضافته</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  @for (emp of unselectedEmployees(); track emp.id) {
                    <button (click)="toggleSelect(emp.id)"
                            class="flex items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2.5 text-right hover:border-yellow-300 hover:bg-yellow-50/40 transition-colors w-full">
                      <div class="text-right min-w-0 flex-1">
                        <p class="font-cairo font-semibold text-sm text-gray-800 truncate">{{ emp.nameAr || emp.name }}</p>
                        <p class="font-cairo text-xs text-gray-400 truncate">{{ emp.role }}</p>
                      </div>
                      <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                           style="background:hsl(42,80%,45%,0.1); color:hsl(42,80%,45%)">{{ emp.avatar }}</div>
                    </button>
                  }
                </div>
              </div>

              <div class="px-5 pb-5">
                <button (click)="startEvaluation()" [disabled]="selected().size === 0"
                        class="w-full py-3 rounded-xl text-white font-cairo font-bold text-sm disabled:opacity-40"
                        style="background:hsl(42,80%,45%)">
                  بدء التقييم ({{ selected().size }} {{ selected().size === 1 ? 'موظف' : 'موظفين' }}) ←
                </button>
              </div>
            </div>
          }

          <!-- ════════════════════════════════════════════ -->
          <!-- STEP 2 — Star-rating sheet, one at a time   -->
          <!-- ════════════════════════════════════════════ -->
          @if (phase() === 'evaluate' && currentEntry()) {
            <div class="flex items-center justify-between" dir="rtl">
              <button (click)="phase.set('select')" class="text-sm text-gray-400 hover:text-gray-600 font-cairo">→ رجوع</button>
              <span class="text-sm font-semibold text-gray-600 font-cairo">{{ currentIndex() + 1 }} / {{ evalEntries().length }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div class="h-1.5 rounded-full transition-all duration-500" style="background:hsl(42,80%,45%)"
                   [style.width]="((currentIndex() + 1) / evalEntries().length * 100) + '%'"></div>
            </div>

            <div class="bg-white rounded-2xl shadow-sm overflow-hidden" dir="rtl">
              <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <button (click)="prev()" class="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
                <p class="font-cairo font-bold" style="color:hsl(42,80%,45%)">
                  تقييم: {{ currentEntry()!.employee.nameAr || currentEntry()!.employee.name }}
                </p>
              </div>

              <div class="p-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-0">
                  @for (key of criteriaKeys; track key) {
                    <div class="py-4 border-b border-gray-100">
                      <p class="text-sm font-cairo text-gray-700 text-right mb-1.5">{{ criteriaLabels[key]?.ar }}</p>
                      <div class="flex items-center gap-1 justify-end">
                        <span class="text-xs text-gray-400 font-mono me-1">({{ currentEntry()!.form[key] }}.0)</span>
                        @for (star of [1,2,3,4,5]; track star) {
                          <button type="button" (click)="setRating(key, star)"
                                  class="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none"
                                  [style]="star <= currentEntry()!.form[key] ? 'color:hsl(42,80%,45%)' : 'color:#d1d5db'">
                            {{ star <= currentEntry()!.form[key] ? '★' : '☆' }}
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>

                <textarea [(ngModel)]="currentEntry()!.notes" placeholder="ملاحظات (اختياري)..." rows="2" dir="rtl"
                          class="input-field w-full resize-none mt-5 font-cairo text-right"></textarea>

                <div class="flex items-center justify-between py-3 px-4 rounded-xl mt-4"
                     style="background:hsl(42,80%,45%,0.06)">
                  <span class="text-2xl font-bold" style="color:hsl(42,80%,45%)">{{ getOverall(currentEntry()!.form) }} / 5</span>
                  <span class="text-sm font-cairo font-semibold text-gray-600">المتوسط العام</span>
                </div>

                <div class="flex gap-3 mt-5" dir="ltr">
                  @if (currentIndex() > 0) {
                    <button (click)="prev()"
                            class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-cairo font-semibold text-gray-600 hover:bg-gray-50">
                      ← السابق
                    </button>
                  }
                  <button (click)="saveAndNext()"
                          class="flex-1 py-2.5 rounded-xl text-white font-cairo font-bold text-sm"
                          [style]="currentEntry()!.saved ? 'background:hsl(150,60%,40%)' : 'background:hsl(42,80%,45%)'">
                    @if (currentEntry()!.saved && currentIndex() < evalEntries().length - 1) { التالي → }
                    @else if (currentEntry()!.saved && currentIndex() === evalEntries().length - 1) { الانتقال للإرسال }
                    @else if (currentIndex() < evalEntries().length - 1) { حفظ والتالي → }
                    @else { حفظ وإنهاء }
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- ══════════════════════ -->
          <!-- STEP 3 — Submit       -->
          <!-- ══════════════════════ -->
          @if (phase() === 'submit') {
            <div class="bg-white rounded-2xl shadow-sm overflow-hidden" dir="rtl">
              <div class="p-5 border-b border-gray-100" style="background:hsl(42,80%,45%,0.04)">
                <h2 class="font-cairo font-bold text-gray-800">مراجعة وإرسال</h2>
                <p class="text-sm font-cairo text-gray-400 mt-0.5">{{ savedCount() }} تقييم جاهز للإرسال</p>
              </div>
              <div class="divide-y divide-gray-50">
                @for (entry of evalEntries(); track entry.employee.id) {
                  <div class="flex items-center justify-between px-5 py-3">
                    <div class="flex items-center gap-2">
                      <button (click)="goToEntry(evalEntries().indexOf(entry))"
                              class="text-xs text-gray-400 hover:text-gray-700 underline font-cairo">تعديل</button>
                      <span class="font-bold text-xl" style="color:hsl(42,80%,45%)">{{ getOverall(entry.form) }}</span>
                      <span class="text-xs text-gray-300">/5</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <div>
                        <p class="font-cairo font-semibold text-sm text-gray-800">{{ entry.employee.nameAr || entry.employee.name }}</p>
                        <p class="text-xs text-gray-400 font-cairo">{{ entry.employee.role }}</p>
                      </div>
                      <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                           style="background:hsl(42,80%,45%,0.12); color:hsl(42,80%,45%)">{{ entry.employee.avatar }}</div>
                    </div>
                  </div>
                }
              </div>
              <div class="p-5 space-y-3">
                @if (submitError()) {
                  <p class="text-sm text-red-500 font-cairo">{{ submitError() }}</p>
                }
                <button (click)="submitAll()" [disabled]="submitting()"
                        class="w-full py-3 rounded-xl text-white font-cairo font-bold disabled:opacity-40"
                        style="background:hsl(210,80%,50%)">
                  {{ submitting() ? 'جاري الإرسال...' : 'إرسال جميع التقييمات وإغلاق الجلسة' }}
                </button>
              </div>
            </div>
          }

          <!-- ════════════════════════════════════════════════ -->
          <!-- STEP 4 — Results: show submitted evaluations     -->
          <!-- ════════════════════════════════════════════════ -->
          @if (phase() === 'results') {
            <div class="space-y-4" dir="rtl">
              <div class="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <div class="text-4xl mb-2">✅</div>
                <h2 class="font-cairo font-bold text-green-800 text-lg">تم إرسال التقييمات بنجاح</h2>
                <p class="text-green-600 text-sm font-cairo mt-1">فيما يلي ملخص التقييمات المُرسلة</p>
              </div>

              @for (result of submittedResults(); track result.employeeId) {
                <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <!-- Employee banner -->
                  <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100"
                       style="background:hsl(42,80%,45%,0.04)">
                    <div>
                      <p class="font-cairo font-bold text-gray-800">{{ result.employeeName }}</p>
                      <p class="text-xs text-gray-400 font-cairo">{{ result.eventName }}</p>
                    </div>
                    <div class="me-auto text-left">
                      <span class="text-3xl font-bold" style="color:hsl(42,80%,45%)">{{ result.overallRating }}</span>
                      <span class="text-sm text-gray-400"> / 5</span>
                    </div>
                  </div>

                  <!-- Criteria grid -->
                  <div class="p-5">
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-0">
                      @for (key of criteriaKeys; track key) {
                        <div class="py-3 border-b border-gray-100">
                          <p class="text-xs font-cairo text-gray-600 text-right mb-1">{{ criteriaLabels[key]?.ar }}</p>
                          <div class="flex items-center gap-0.5 justify-end">
                            <span class="text-xs text-gray-400 font-mono me-1">({{ $any(result.criteria)[key] }}.0)</span>
                            @for (star of [1,2,3,4,5]; track star) {
                              <span class="text-xl leading-none"
                                    [style]="star <= $any(result.criteria)[key] ? 'color:hsl(42,80%,45%)' : 'color:#d1d5db'">
                                {{ star <= $any(result.criteria)[key] ? '★' : '☆' }}
                              </span>
                            }
                          </div>
                        </div>
                      }
                    </div>

                    @if (result.notes) {
                      <div class="mt-4 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <p class="text-xs text-gray-400 font-cairo mb-1">ملاحظات</p>
                        <p class="text-sm font-cairo text-gray-700">{{ result.notes }}</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          }

        </div>
      }
    </div>
  `,
  styles: [`.input-field { border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; outline:none; width:100%; } .input-field:focus { border-color:hsl(42,80%,45%); }`]
})
export class EmployeeAccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http  = inject(HttpClient);
  private readonly BASE = 'http://localhost:3000/api';

  token       = '';
  access      = signal<TokenAccess | null>(null);
  loading     = signal(true);
  errorMsg    = signal('');
  submitting  = signal(false);
  submitError = signal('');

  phase            = signal<'select' | 'evaluate' | 'submit' | 'results'>('select');
  selected         = signal<Set<string>>(new Set());
  evalEntries      = signal<EvalEntry[]>([]);
  currentIndex     = signal(0);
  submittedResults = signal<Evaluation[]>([]);

  criteriaKeys   = Object.keys(CRITERIA_LABELS);
  criteriaLabels = CRITERIA_LABELS;

  currentEntry = computed(() => this.evalEntries()[this.currentIndex()] ?? null);
  savedCount   = computed(() => this.evalEntries().filter(e => e.saved).length);

  // Self is already excluded by the server; computed helpers for the picker
  selectedEmployees   = computed(() => (this.access()?.employees ?? []).filter(e => this.selected().has(e.id)));
  unselectedEmployees = computed(() => (this.access()?.employees ?? []).filter(e => !this.selected().has(e.id)));

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
      this.errorMsg.set(err?.error?.message ?? 'Invalid or expired link');
    } finally {
      this.loading.set(false);
    }
  }

  toggleSelect(id: string) {
    const s = new Set(this.selected());
    s.has(id) ? s.delete(id) : s.add(id);
    this.selected.set(s);
  }

  startEvaluation() {
    const data = this.access()!;
    const myService = data.events.flatMap(ev =>
      ev.services
        .filter(s => s.projectManagerId === data.employee.id)
        .map(s => ({ event: ev, service: s }))
    )[0];

    const entries: EvalEntry[] = data.employees
      .filter(emp => this.selected().has(emp.id))
      .map(emp => ({
        employee:    emp,
        eventId:     myService?.event.id     ?? data.events[0]?.id ?? '',
        eventName:   myService?.event.name   ?? data.events[0]?.name ?? '',
        serviceId:   myService?.service.id   ?? '',
        serviceType: myService?.service.type ?? '',
        form: this.defaultForm(),
        notes: '',
        saved: false,
      }));

    this.evalEntries.set(entries);
    this.currentIndex.set(0);
    this.phase.set('evaluate');
  }

  defaultForm(): Record<string, number> {
    return Object.fromEntries(this.criteriaKeys.map(k => [k, 3]));
  }

  setRating(key: string, value: number) {
    const entry = this.currentEntry();
    if (!entry) return;
    entry.form[key] = value;
    this.evalEntries.set([...this.evalEntries()]);
  }

  getOverall(form: Record<string, number>): number {
    const total = Object.values(form).reduce((a, v) => a + Number(v), 0);
    return Math.round((total / this.criteriaKeys.length) * 10) / 10;
  }

  saveAndNext() {
    const entry = this.currentEntry();
    if (!entry) return;
    entry.saved = true;
    this.evalEntries.set([...this.evalEntries()]);
    if (this.currentIndex() < this.evalEntries().length - 1) {
      this.currentIndex.update(i => i + 1);
    } else {
      this.phase.set('submit');
    }
  }

  prev() {
    if (this.currentIndex() > 0) this.currentIndex.update(i => i - 1);
  }

  goToEntry(index: number) {
    this.currentIndex.set(index);
    this.phase.set('evaluate');
  }

  async submitAll() {
    const data = this.access()!;
    const evaluations = this.evalEntries().map(entry => ({
      eventId:       entry.eventId,
      eventName:     entry.eventName,
      serviceType:   entry.serviceType,
      employeeId:    entry.employee.id,
      employeeName:  entry.employee.nameAr,
      evaluatorId:   data.employee.id,
      evaluatorName: data.employee.nameAr,
      date:          new Date().toISOString().slice(0, 10),
      criteria:      entry.form,
      overallRating: this.getOverall(entry.form),
      notes:         entry.notes,
    }));

    this.submitting.set(true);
    this.submitError.set('');
    try {
      const res = await firstValueFrom(
        this.http.post<{ message: string; evaluations: Evaluation[] }>(
          `${this.BASE}/access/${this.token}/evaluate`, evaluations
        )
      );
      // Show results page with submitted evaluations
      this.submittedResults.set(res.evaluations ?? evaluations as any);
      this.phase.set('results');
    } catch (err: any) {
      this.submitError.set(err?.error?.message ?? 'Error submitting evaluations');
    } finally {
      this.submitting.set(false);
    }
  }
}

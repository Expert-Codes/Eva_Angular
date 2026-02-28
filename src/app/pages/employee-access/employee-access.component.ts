import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TokenAccess, Employee, CRITERIA_LABELS } from '../../models/data.models';

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

      @if (done()) {
        <div class="flex items-center justify-center min-h-screen">
          <div class="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
            <div class="text-6xl mb-4">✅</div>
            <h2 class="font-bold text-gray-800 text-xl mb-2">Evaluations Submitted!</h2>
            <p class="text-gray-400 text-sm">Thank you. Your evaluations have been recorded and this link has expired.</p>
          </div>
        </div>
      }

      @if (access() && !loading() && !errorMsg() && !done()) {
        <div class="max-w-2xl mx-auto space-y-5 py-6">

          <!-- Manager header -->
          <div class="bg-white rounded-2xl p-5 shadow-sm">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl shrink-0"
                   style="background:hsl(42,80%,45%,0.12); color:hsl(42,80%,45%)">
                {{ access()!.employee.avatar }}
              </div>
              <div>
                <h1 class="font-bold text-lg text-gray-800">{{ access()!.employee.name || access()!.employee.nameAr }}</h1>
                <p class="text-sm text-gray-400">{{ access()!.employee.role }}</p>
              </div>
              <div class="ms-auto flex items-center gap-1.5">
                <span class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                      [style]="phase() === 'select' ? 'background:hsl(42,80%,45%);color:white' : 'background:#e5e7eb;color:#6b7280'">1</span>
                <div class="w-5 h-0.5 bg-gray-200"></div>
                <span class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                      [style]="phase() !== 'select' ? 'background:hsl(42,80%,45%);color:white' : 'background:#e5e7eb;color:#6b7280'">2</span>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-3">🕒 Expires: {{ access()!.expiresAt | date:'MMM d, y — HH:mm' }}</p>
          </div>

          <!-- ═══════════════════════════ -->
          <!-- STEP 1 — Select team       -->
          <!-- ═══════════════════════════ -->
          @if (phase() === 'select') {
            <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-100" style="background:hsl(42,80%,45%,0.04)">
                <h2 class="font-bold text-gray-800">Step 1 — Select your team</h2>
                <p class="text-sm text-gray-400 mt-0.5">Choose the employees you want to evaluate</p>
              </div>

              <div class="divide-y divide-gray-50">
                @for (emp of access()!.employees; track emp.id) {
                  <label class="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none">
                    <input type="checkbox" [checked]="selected().has(emp.id)"
                           (change)="toggleSelect(emp.id)"
                           class="w-5 h-5 rounded cursor-pointer shrink-0 accent-yellow-600"/>
                    <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                         style="background:hsl(42,80%,45%,0.12); color:hsl(42,80%,45%)">{{ emp.avatar }}</div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-800 text-sm">{{ emp.name || emp.nameAr }}</p>
                      <p class="text-xs text-gray-400">{{ emp.nameAr }}</p>
                      <p class="text-xs text-gray-300 mt-0.5">{{ emp.role }}</p>
                    </div>
                    @if (selected().has(emp.id)) {
                      <span class="text-green-500 text-lg shrink-0">✓</span>
                    }
                  </label>
                }
              </div>

              <div class="p-4 border-t border-gray-100 space-y-3">
                <div class="flex items-center justify-between">
                  <p class="text-sm text-gray-500">{{ selected().size }} of {{ access()!.employees.length }} selected</p>
                  <button (click)="selectAll()" class="text-xs font-semibold" style="color:hsl(42,80%,45%)">
                    {{ selected().size === access()!.employees.length ? 'Deselect All' : 'Select All' }}
                  </button>
                </div>
                <button (click)="startEvaluation()" [disabled]="selected().size === 0"
                        class="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40"
                        style="background:hsl(42,80%,45%)">
                  Start Evaluation ({{ selected().size }} {{ selected().size === 1 ? 'employee' : 'employees' }}) →
                </button>
              </div>
            </div>
          }

          <!-- ═════════════════════════════════════════ -->
          <!-- STEP 2 — Evaluation sheet, one at a time -->
          <!-- ═════════════════════════════════════════ -->
          @if (phase() === 'evaluate' && currentEntry()) {
            <div class="flex items-center justify-between">
              <button (click)="phase.set('select')" class="text-sm text-gray-400 hover:text-gray-600">← Back</button>
              <span class="text-sm font-semibold text-gray-600">{{ currentIndex() + 1 }} / {{ evalEntries().length }}</span>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-1.5">
              <div class="h-1.5 rounded-full transition-all duration-500" style="background:hsl(42,80%,45%)"
                   [style.width]="((currentIndex() + 1) / evalEntries().length * 100) + '%'"></div>
            </div>

            <!-- Evaluation sheet -->
            <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div class="p-5 border-b border-gray-100 flex items-center gap-4" style="background:hsl(42,80%,45%,0.04)">
                <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
                     style="background:hsl(42,80%,45%,0.15); color:hsl(42,80%,45%)">
                  {{ currentEntry()!.employee.avatar }}
                </div>
                <div>
                  <p class="font-bold text-gray-800 text-lg">{{ currentEntry()!.employee.name || currentEntry()!.employee.nameAr }}</p>
                  <p class="text-sm text-gray-400">{{ currentEntry()!.employee.nameAr }} · {{ currentEntry()!.employee.role }}</p>
                  @if (currentEntry()!.eventName) {
                    <p class="text-xs text-gray-300 mt-0.5">{{ currentEntry()!.eventName }}</p>
                  }
                </div>
                @if (currentEntry()!.saved) {
                  <span class="ms-auto text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded-full">✓ Saved</span>
                }
              </div>

              <div class="p-5 space-y-5">
                <!-- Same criteria grid as admin evaluation sheet -->
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  @for (key of criteriaKeys; track key) {
                    <div class="space-y-1">
                      <label class="text-xs font-semibold text-gray-600">{{ criteriaLabels[key]?.en }}</label>
                      <p class="text-[10px] text-gray-400 leading-tight">{{ criteriaLabels[key]?.ar }}</p>
                      <input type="number" min="1" max="5"
                             [(ngModel)]="currentEntry()!.form[key]"
                             class="input-field w-full text-center font-bold text-base"/>
                    </div>
                  }
                </div>

                <!-- Overall preview -->
                <div class="flex items-center justify-between py-3 px-4 rounded-xl"
                     style="background:hsl(42,80%,45%,0.06)">
                  <span class="text-sm font-semibold text-gray-600">Overall Rating</span>
                  <span class="text-2xl font-bold" style="color:hsl(42,80%,45%)">
                    {{ getOverall(currentEntry()!.form) }} / 5
                  </span>
                </div>

                <textarea [(ngModel)]="currentEntry()!.notes"
                          placeholder="Notes (optional)..." rows="2"
                          class="input-field w-full resize-none"></textarea>

                <div class="flex gap-3">
                  @if (currentIndex() > 0) {
                    <button (click)="prev()"
                            class="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600">
                      ← Prev
                    </button>
                  }
                  <button (click)="saveAndNext()"
                          class="flex-1 py-2.5 rounded-xl text-white font-bold text-sm"
                          [style]="currentEntry()!.saved ? 'background:hsl(150,60%,40%)' : 'background:hsl(42,80%,45%)'">
                    @if (currentEntry()!.saved && currentIndex() < evalEntries().length - 1) { Next → }
                    @else if (currentEntry()!.saved && currentIndex() === evalEntries().length - 1) { Go to Submit }
                    @else if (currentIndex() < evalEntries().length - 1) { Save & Next → }
                    @else { Save & Finish }
                  </button>
                </div>
              </div>
            </div>
          }

          <!-- ══════════════════ -->
          <!-- STEP 3 — Submit   -->
          <!-- ══════════════════ -->
          @if (phase() === 'submit') {
            <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div class="p-5 border-b border-gray-100" style="background:hsl(42,80%,45%,0.04)">
                <h2 class="font-bold text-gray-800">Review & Submit</h2>
                <p class="text-sm text-gray-400 mt-0.5">{{ savedCount() }} evaluation(s) ready</p>
              </div>
              <div class="divide-y divide-gray-50">
                @for (entry of evalEntries(); track entry.employee.id) {
                  <div class="flex items-center justify-between px-5 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                           style="background:hsl(42,80%,45%,0.12); color:hsl(42,80%,45%)">{{ entry.employee.avatar }}</div>
                      <div>
                        <p class="font-semibold text-sm text-gray-800">{{ entry.employee.name || entry.employee.nameAr }}</p>
                        <p class="text-xs text-gray-400">{{ entry.employee.role }}</p>
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-xl" style="color:hsl(42,80%,45%)">{{ getOverall(entry.form) }}</span>
                      <span class="text-xs text-gray-300">/5</span>
                      <button (click)="goToEntry(evalEntries().indexOf(entry))"
                              class="text-xs text-gray-400 hover:text-gray-700 underline ms-3">Edit</button>
                    </div>
                  </div>
                }
              </div>
              <div class="p-5 space-y-3">
                @if (submitError()) {
                  <p class="text-sm text-red-500">{{ submitError() }}</p>
                }
                <button (click)="submitAll()" [disabled]="submitting()"
                        class="w-full py-3 rounded-xl text-white font-bold disabled:opacity-40"
                        style="background:hsl(210,80%,50%)">
                  {{ submitting() ? 'Submitting...' : 'Submit All & Close Session' }}
                </button>
              </div>
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
  done        = signal(false);
  submitting  = signal(false);
  submitError = signal('');

  phase        = signal<'select' | 'evaluate' | 'submit'>('select');
  selected     = signal<Set<string>>(new Set());
  evalEntries  = signal<EvalEntry[]>([]);
  currentIndex = signal(0);

  criteriaKeys   = Object.keys(CRITERIA_LABELS);
  criteriaLabels = CRITERIA_LABELS;

  currentEntry = computed(() => this.evalEntries()[this.currentIndex()] ?? null);
  savedCount   = computed(() => this.evalEntries().filter(e => e.saved).length);

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

  selectAll() {
    const all = this.access()!.employees;
    if (this.selected().size === all.length) this.selected.set(new Set());
    else this.selected.set(new Set(all.map(e => e.id)));
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
    return Object.fromEntries(this.criteriaKeys.map(k => [k, 4]));
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
      await firstValueFrom(
        this.http.post(`${this.BASE}/access/${this.token}/evaluate`, evaluations)
      );
      this.done.set(true);
    } catch (err: any) {
      this.submitError.set(err?.error?.message ?? 'Error submitting evaluations');
    } finally {
      this.submitting.set(false);
    }
  }
}

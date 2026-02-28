import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { TokenAccess, EventData, EventService, Employee, CRITERIA_LABELS, SERVICE_LABELS_EN, SERVICE_LABELS_AR } from '../../models/data.models';

type Phase = 'select' | 'evaluate';

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

      <!-- Loading -->
      @if (loading()) {
        <div class="flex items-center justify-center min-h-screen">
          <div class="text-center space-y-3">
            <div class="w-10 h-10 border-4 rounded-full border-t-transparent mx-auto animate-spin" style="border-color:hsl(42,80%,45%); border-top-color:transparent"></div>
            <p class="text-gray-400">Verifying link...</p>
          </div>
        </div>
      }

      <!-- Error -->
      @if (errorMsg()) {
        <div class="flex items-center justify-center min-h-screen">
          <div class="bg-white rounded-2xl p-8 text-center shadow-lg max-w-sm w-full">
            <div class="text-5xl mb-4">⛔</div>
            <p class="font-bold text-gray-800 text-lg">{{ errorMsg() }}</p>
            <p class="text-sm text-gray-400 mt-2">Please contact your administrator for a new link.</p>
          </div>
        </div>
      }

      <!-- Done -->
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

          <!-- Manager Header -->
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
              <!-- Step indicator -->
              <div class="ms-auto flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <span class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                        [style]="phase() === 'select' ? 'background:hsl(42,80%,45%);color:white' : 'background:#e5e7eb;color:#6b7280'">1</span>
                  <div class="w-6 h-0.5 bg-gray-200"></div>
                  <span class="w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center"
                        [style]="phase() === 'evaluate' ? 'background:hsl(42,80%,45%);color:white' : 'background:#e5e7eb;color:#6b7280'">2</span>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-400 mt-3 flex items-center gap-1">
              <span>🕒</span> Link expires: {{ access()!.expiresAt | date:'MMM d, y — HH:mm' }}
            </p>
          </div>

          <!-- ══════════════════════════════════════ -->
          <!-- PHASE 1 — Select team members         -->
          <!-- ══════════════════════════════════════ -->
          @if (phase() === 'select') {
            <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-100" style="background:hsl(42,80%,45%,0.04)">
                <h2 class="font-bold text-gray-800">Step 1 — Select your team</h2>
                <p class="text-sm text-gray-400 mt-0.5">Choose the employees you worked with in this event</p>
              </div>

              @if (teamEmployees().length === 0) {
                <div class="p-8 text-center text-gray-400">
                  <p class="text-3xl mb-2">👥</p>
                  <p class="text-sm">No team members found in your assigned services.</p>
                  <p class="text-xs mt-1 text-gray-300">Ask your admin to add employees to your service first.</p>
                </div>
              } @else {
                <div class="divide-y divide-gray-50">
                  @for (emp of teamEmployees(); track emp.id) {
                    <label class="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors select-none">
                      <input type="checkbox" [checked]="selected().has(emp.id)"
                             (change)="toggleSelect(emp.id)"
                             class="w-5 h-5 rounded accent-yellow-600 cursor-pointer shrink-0"/>
                      <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                           style="background:hsl(42,80%,45%,0.12); color:hsl(42,80%,45%)">
                        {{ emp.avatar }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-gray-800 text-sm">{{ emp.name || emp.nameAr }}</p>
                        <p class="text-xs text-gray-400">{{ emp.nameAr }}</p>
                        <p class="text-xs text-gray-300 mt-0.5">{{ emp.role }}</p>
                      </div>
                      @if (selected().has(emp.id)) {
                        <span class="text-lg shrink-0">✓</span>
                      }
                    </label>
                  }
                </div>

                <div class="p-4 border-t border-gray-100">
                  <div class="flex items-center justify-between mb-3">
                    <p class="text-sm text-gray-500">{{ selected().size }} of {{ teamEmployees().length }} selected</p>
                    <button (click)="selectAll()" class="text-xs font-semibold" style="color:hsl(42,80%,45%)">
                      {{ selected().size === teamEmployees().length ? 'Deselect All' : 'Select All' }}
                    </button>
                  </div>
                  <button (click)="startEvaluation()"
                          [disabled]="selected().size === 0"
                          class="w-full py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40 transition-opacity"
                          style="background:hsl(42,80%,45%)">
                    Begin Evaluation ({{ selected().size }} {{ selected().size === 1 ? 'employee' : 'employees' }}) →
                  </button>
                </div>
              }
            </div>
          }

          <!-- ══════════════════════════════════════ -->
          <!-- PHASE 2 — Evaluate selected employees  -->
          <!-- ══════════════════════════════════════ -->
          @if (phase() === 'evaluate') {
            <div class="flex items-center justify-between">
              <h2 class="font-bold text-gray-800">Step 2 — Evaluate your team</h2>
              <button (click)="phase.set('select')" class="text-sm text-gray-400 hover:text-gray-600">← Back</button>
            </div>

            <!-- Progress -->
            <div class="space-y-1">
              <div class="flex justify-between text-xs text-gray-400">
                <span>Saved evaluations</span>
                <span>{{ savedCount() }}/{{ evalEntries().length }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="h-2 rounded-full transition-all duration-500" style="background:hsl(42,80%,45%)"
                     [style.width]="(evalEntries().length ? (savedCount()/evalEntries().length*100) : 0) + '%'"></div>
              </div>
            </div>

            <!-- One card per employee -->
            @for (entry of evalEntries(); track entry.employee.id + entry.serviceId) {
              <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
                <!-- Employee header -->
                <div class="p-4 border-b border-gray-100 flex items-center gap-3"
                     [style]="entry.saved ? 'background:hsl(150,60%,40%,0.06)' : 'background:hsl(42,80%,45%,0.04)'">
                  <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0"
                       style="background:hsl(42,80%,45%,0.12); color:hsl(42,80%,45%)">
                    {{ entry.employee.avatar }}
                  </div>
                  <div class="flex-1">
                    <p class="font-bold text-gray-800">{{ entry.employee.name || entry.employee.nameAr }}</p>
                    <p class="text-xs text-gray-400">{{ entry.employee.role }} · {{ entry.eventName }}</p>
                  </div>
                  @if (entry.saved) {
                    <span class="text-green-600 font-bold text-sm">✓ Saved</span>
                  }
                </div>

                <!-- Criteria grid -->
                <div class="p-4 space-y-4">
                  <div class="grid grid-cols-2 gap-3">
                    @for (key of criteriaKeys; track key) {
                      <div class="space-y-1">
                        <label class="text-xs text-gray-500">{{ criteriaLabels[key]?.en }}</label>
                        <p class="text-[10px] text-gray-300">{{ criteriaLabels[key]?.ar }}</p>
                        <div class="flex items-center gap-1.5">
                          @for (star of [1,2,3,4,5]; track star) {
                            <button type="button" (click)="entry.form[key] = star"
                                    class="w-8 h-8 rounded-lg text-sm font-bold transition-all"
                                    [style]="entry.form[key] >= star
                                      ? 'background:hsl(42,80%,45%);color:white'
                                      : 'background:#f3f4f6;color:#9ca3af'">
                              {{ star }}
                            </button>
                          }
                        </div>
                      </div>
                    }
                  </div>

                  <textarea [(ngModel)]="entry.notes" placeholder="Notes (optional)..."
                            rows="2" class="input-field w-full resize-none text-sm"></textarea>

                  <button (click)="saveEntry(entry)"
                          class="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                          [style]="entry.saved ? 'background:hsl(150,60%,40%)' : 'background:hsl(42,80%,45%)'">
                    {{ entry.saved ? '✓ Evaluation Saved' : 'Save Evaluation' }}
                  </button>
                </div>
              </div>
            }

            <!-- Submit all -->
            <div class="bg-white rounded-2xl p-5 shadow-sm space-y-3">
              @if (submitError()) {
                <p class="text-sm text-red-500">{{ submitError() }}</p>
              }
              @if (savedCount() < evalEntries().length) {
                <p class="text-xs text-center text-amber-600">
                  ⚠ {{ evalEntries().length - savedCount() }} evaluation(s) not saved yet
                </p>
              }
              <button (click)="submitAll()" [disabled]="submitting() || savedCount() === 0"
                      class="w-full py-3 rounded-xl text-white font-bold disabled:opacity-40 transition-opacity"
                      style="background:hsl(210,80%,50%)">
                {{ submitting() ? 'Submitting...' : 'Submit All & Close Session' }}
              </button>
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

  token    = '';
  access   = signal<TokenAccess | null>(null);
  loading  = signal(true);
  errorMsg = signal('');
  done     = signal(false);
  submitting  = signal(false);
  submitError = signal('');

  phase       = signal<Phase>('select');
  selected    = signal<Set<string>>(new Set());
  evalEntries = signal<EvalEntry[]>([]);

  criteriaKeys   = Object.keys(CRITERIA_LABELS);
  criteriaLabels = CRITERIA_LABELS;

  /** All employees across the manager's services (self excluded) */
  teamEmployees = computed<Employee[]>(() => {
    const data = this.access();
    if (!data) return [];
    return data.employees;
  });

  savedCount = computed(() => this.evalEntries().filter(e => e.saved).length);

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
      const msg = err?.error?.message ?? 'Invalid or expired link';
      this.errorMsg.set(msg);
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
    const all = this.teamEmployees();
    if (this.selected().size === all.length)
      this.selected.set(new Set());
    else
      this.selected.set(new Set(all.map(e => e.id)));
  }

  startEvaluation() {
    const data = this.access()!;
    const entries: EvalEntry[] = [];

    // For every service where this manager is projectManager, add selected employees
    for (const event of data.events) {
      for (const service of event.services) {
        if (service.projectManagerId !== data.employee.id) continue;
        for (const emp of data.employees) {
          if (!this.selected().has(emp.id)) continue;
          if (!service.employeeIds.includes(emp.id)) continue;
          entries.push({
            employee: emp,
            eventId: event.id,
            eventName: event.name || event.nameAr,
            serviceId: service.id,
            serviceType: service.type,
            form: this.defaultForm(),
            notes: '',
            saved: false,
          });
        }
      }
    }

    this.evalEntries.set(entries);
    this.phase.set('evaluate');
  }

  defaultForm(): Record<string, number> {
    return Object.fromEntries(this.criteriaKeys.map(k => [k, 4]));
  }

  saveEntry(entry: EvalEntry) {
    entry.saved = true;
    // Trigger change detection by replacing the array
    this.evalEntries.set([...this.evalEntries()]);
  }

  async submitAll() {
    const data = this.access()!;
    const entries = this.evalEntries().filter(e => e.saved);
    if (!entries.length) {
      this.submitError.set('No saved evaluations yet. Please save at least one evaluation first.');
      return;
    }

    const evaluations = entries.map(entry => {
      const total = Object.values(entry.form).reduce((a, v) => a + v, 0);
      return {
        eventId: entry.eventId,
        eventName: entry.eventName,
        serviceType: entry.serviceType,
        employeeId: entry.employee.id,
        employeeName: entry.employee.nameAr,
        evaluatorId: data.employee.id,
        evaluatorName: data.employee.nameAr,
        date: new Date().toISOString().slice(0, 10),
        criteria: entry.form,
        overallRating: Math.round((total / this.criteriaKeys.length) * 10) / 10,
        notes: entry.notes,
      };
    });

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

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { LangService } from '../../services/lang.service';
import { RatingStarsComponent } from '../../components/rating-stars/rating-stars.component';
import { ServiceBadgeComponent } from '../../components/service-badge/service-badge.component';
import { Employee, ServiceType } from '../../models/data.models';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule, FormsModule, RatingStarsComponent, ServiceBadgeComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-cairo font-bold">{{ lang.t('الموظفين', 'Employees') }}</h1>
          <p class="text-gray-500 text-sm mt-1">{{ lang.t('قائمة جميع الموظفين وتخصصاتهم', 'All employees and their specializations') }}</p>
        </div>
        <button (click)="openAdd()"
                class="px-4 py-2 rounded-lg text-sm font-cairo font-semibold text-white"
                style="background:hsl(42,80%,45%)">
          + {{ lang.t('إضافة موظف', 'Add Employee') }}
        </button>
      </div>

      <!-- Employee Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (emp of ds.employees(); track emp.id) {
          <div class="card-glass rounded-xl p-5 hover:border-yellow-300 transition-all animate-fade-in">
            <!-- Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                     style="background:rgba(180,120,20,0.12); color:hsl(42,80%,45%)">{{ emp.avatar }}</div>
                <div>
                  <p class="font-cairo font-bold">{{ lang.isAr ? emp.nameAr : emp.name }}</p>
                  <p class="text-xs text-gray-400">{{ emp.role }}</p>
                </div>
              </div>
              <button (click)="openEdit(emp)"
                      class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm"
                      [title]="lang.t('تعديل', 'Edit')">✏️</button>
            </div>

            <div class="space-y-3">
              <app-service-badge [type]="emp.specialization"/>
              <app-rating-stars [rating]="emp.avgRating" size="sm"/>

              <div class="space-y-1 pt-2 border-t border-gray-100 text-xs text-gray-400">
                <div class="flex items-center justify-between">
                  <span>📅 {{ emp.joinDate }}</span>
                  @if (emp.phone) { <span>📞 {{ emp.phone }}</span> }
                </div>
                @if (emp.email) {
                  <div class="flex items-center gap-1 truncate">
                    <span>📧</span><span class="truncate">{{ emp.email }}</span>
                  </div>
                }
              </div>

              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400">{{ lang.t('الفعاليات المشارك فيها', 'Events Participated') }}</span>
                <span class="font-bold" style="color:hsl(42,80%,45%)">{{ emp.totalEvents }}</span>
              </div>

              <!-- Resend / Generate evaluation link — always visible -->
              <button (click)="generateLink(emp)"
                      class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-semibold transition-all"
                      style="border-color:hsl(210,80%,55%); color:hsl(210,80%,45%)"
                      [class.opacity-60]="sending() === emp.id"
                      [disabled]="sending() === emp.id">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
                <span class="font-cairo">
                  {{ sending() === emp.id ? lang.t('جاري الإنشاء...', 'Generating...') : lang.t('رابط التقييم', 'Evaluation Link') }}
                </span>
              </button>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Add / Edit Employee Dialog -->
    @if (showDialog()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4 my-4" [attr.dir]="lang.isAr ? 'rtl' : 'ltr'">
          <h2 class="font-cairo font-bold text-lg">
            {{ editingId() ? lang.t('تعديل بيانات الموظف', 'Edit Employee') : lang.t('إضافة موظف جديد', 'Add New Employee') }}
          </h2>

          <input [(ngModel)]="form.nameAr" [placeholder]="lang.t('الاسم بالعربية *', 'Name in Arabic *')" class="input-field w-full"/>
          <input [(ngModel)]="form.name"   [placeholder]="lang.t('الاسم بالإنجليزية', 'Name in English')" class="input-field w-full"/>
          <input [(ngModel)]="form.role"   [placeholder]="lang.t('المنصب', 'Job Title')" class="input-field w-full"/>
          <input [(ngModel)]="form.phone"  [placeholder]="lang.t('رقم الهاتف', 'Phone Number')" class="input-field w-full"/>

          <div class="space-y-1">
            <input [(ngModel)]="form.email" type="email" [placeholder]="lang.t('البريد الإلكتروني', 'Email Address')" class="input-field w-full"/>
            <p class="text-xs text-gray-400 font-cairo">{{ lang.t('إذا تم إدخاله، سيُرسل الرابط بالبريد تلقائياً', 'If provided, the link will also be emailed') }}</p>
          </div>

          <input [(ngModel)]="form.joinDate" type="date" class="input-field w-full"/>

          <select [(ngModel)]="form.specialization" class="input-field w-full">
            <option value="security_management">{{ lang.t('إدارة الأمن', 'Security Management') }}</option>
            <option value="crowd_management">{{ lang.t('إدارة الحشود', 'Crowd Management') }}</option>
            <option value="traffic_management">{{ lang.t('إدارة المرور', 'Traffic Management') }}</option>
            <option value="parking_access">{{ lang.t('إدارة المواقف', 'Parking & Access') }}</option>
            <option value="transportation">{{ lang.t('إدارة النقل', 'Transportation') }}</option>
            <option value="vip_transportation">{{ lang.t('نقل الشخصيات', 'VIP Transportation') }}</option>
            <option value="close_protection">{{ lang.t('الحماية الشخصية', 'Close Protection') }}</option>
            <option value="international_security">{{ lang.t('الأمن الدولي', 'International Security') }}</option>
          </select>

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

    <!-- Link Modal -->
    @if (linkModal()) {
      <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4" [attr.dir]="lang.isAr ? 'rtl' : 'ltr'">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xl">✓</div>
            <div>
              <h3 class="font-cairo font-bold text-gray-800">{{ lang.t('رابط التقييم جاهز', 'Evaluation Link Ready') }}</h3>
              <p class="text-xs text-gray-400">{{ lang.t('صالح لمدة 7 أيام', 'Valid for 7 days') }}</p>
            </div>
          </div>

          <div class="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
            <p class="text-xs text-gray-400 font-cairo">{{ lang.t('انسخ الرابط وأرسله للموظف', 'Copy and send this link to the employee') }}</p>
            <div class="flex items-center gap-2">
              <span class="text-xs text-blue-700 break-all flex-1 select-all font-mono bg-blue-50 p-2 rounded-lg">{{ linkModal() }}</span>
              <button (click)="copyLink()" class="shrink-0 px-3 py-2 rounded-lg text-sm font-semibold transition-colors"
                      [style]="copied() ? 'background:#16a34a;color:white' : 'background:hsl(42,80%,45%);color:white'">
                {{ copied() ? lang.t('تم النسخ ✓', 'Copied ✓') : lang.t('نسخ', 'Copy') }}
              </button>
            </div>
          </div>

          @if (linkEmpHasEmail()) {
            <p class="text-xs text-gray-400 font-cairo flex items-center gap-1">
              <span>📧</span>
              <span>{{ lang.t('تم إرسال الرابط أيضاً بالبريد الإلكتروني', 'The link was also sent by email') }}</span>
            </p>
          }

          <button (click)="closeLinkModal()"
                  class="w-full py-2 rounded-xl font-cairo font-semibold text-white text-sm"
                  style="background:hsl(42,80%,45%)">
            {{ lang.t('إغلاق', 'Close') }}
          </button>
        </div>
      </div>
    }
  `,
  styles: [`.input-field { border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; font-family:'Cairo',sans-serif; outline:none; width:100%; } .input-field:focus { border-color:hsl(42,80%,45%); }`]
})
export class EmployeesComponent {
  ds   = inject(DataService);
  lang = inject(LangService);

  showDialog = signal(false);
  editingId  = signal<string | null>(null);
  saving     = signal(false);
  sending    = signal<string | null>(null);
  feedback   = signal('');
  feedbackOk = signal(false);
  linkModal  = signal<string | null>(null);
  linkEmpHasEmail = signal(false);
  copied     = signal(false);

  form = this.emptyForm();

  emptyForm() {
    return { name: '', nameAr: '', role: '', phone: '', email: '', joinDate: '', specialization: 'security_management' as ServiceType, avatar: '' };
  }

  openAdd() {
    this.form = this.emptyForm();
    this.editingId.set(null);
    this.feedback.set('');
    this.showDialog.set(true);
  }

  openEdit(emp: Employee) {
    this.form = {
      name: emp.name, nameAr: emp.nameAr, role: emp.role,
      phone: emp.phone ?? '', email: emp.email ?? '',
      joinDate: emp.joinDate, specialization: emp.specialization, avatar: emp.avatar,
    };
    this.editingId.set(emp.id);
    this.feedback.set('');
    this.showDialog.set(true);
  }

  async submit() {
    if (!this.form.nameAr.trim()) return;
    if (!this.form.avatar)
      this.form.avatar = this.form.nameAr.split(' ').map((w: string) => w[0]).join('').slice(0, 2);
    this.saving.set(true);
    this.feedback.set('');
    try {
      const id = this.editingId();
      if (id) {
        await this.ds.updateEmployee(id, this.form);
        this.feedback.set(this.lang.t('✓ تم حفظ التعديلات', '✓ Changes saved'));
        this.feedbackOk.set(true);
        setTimeout(() => this.closeDialog(), 800);
      } else {
        await this.ds.addEmployee(this.form);
        this.closeDialog();
      }
    } catch {
      this.feedback.set(this.lang.t('حدث خطأ أثناء الحفظ', 'Error saving changes'));
      this.feedbackOk.set(false);
    } finally {
      this.saving.set(false);
    }
  }

  async generateLink(emp: Employee) {
    this.sending.set(emp.id);
    try {
      const res = await this.ds.resendToken(emp.id);
      const origin = window.location.origin;
      const link = `${origin}/access/${res.token}`;
      this.linkEmpHasEmail.set(!!emp.email);
      this.linkModal.set(link);
      this.copied.set(false);
    } catch {
      alert(this.lang.t('حدث خطأ أثناء إنشاء الرابط', 'Failed to generate link'));
    } finally {
      this.sending.set(null);
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

  closeDialog() {
    this.showDialog.set(false);
    this.editingId.set(null);
    this.form = this.emptyForm();
    this.feedback.set('');
  }
}

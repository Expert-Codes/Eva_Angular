import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
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
          <h1 class="text-2xl font-cairo font-bold">الموظفين</h1>
          <p class="text-gray-500 text-sm mt-1">قائمة جميع الموظفين وتخصصاتهم</p>
        </div>
        <button (click)="openAdd()"
                class="px-4 py-2 rounded-lg text-sm font-cairo font-semibold text-white"
                style="background:hsl(42,80%,45%)">
          + إضافة موظف
        </button>
      </div>

      <!-- Employee Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (emp of ds.employees(); track emp.id) {
          <div class="card-glass rounded-xl p-5 hover:border-yellow-300 transition-all animate-fade-in">
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                     style="background:hsl(42,80%,45%,0.15); color:hsl(42,80%,45%)">{{ emp.avatar }}</div>
                <div>
                  <p class="font-cairo font-bold">{{ emp.nameAr }}</p>
                  <p class="text-xs text-gray-400">{{ emp.role }}</p>
                </div>
              </div>
              <!-- Action buttons -->
              <div class="flex items-center gap-1">
                <button (click)="openEdit(emp)" title="تعديل"
                        class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors text-sm">✏️</button>
                @if (emp.email) {
                  <button (click)="resend(emp)" title="إعادة إرسال رابط التقييم"
                          class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm">📧</button>
                }
              </div>
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
                  <div class="flex items-center gap-1">
                    <span>📧</span><span class="truncate">{{ emp.email }}</span>
                  </div>
                }
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-gray-400">الفعاليات المشارك فيها</span>
                <span class="font-bold" style="color:hsl(42,80%,45%)">{{ emp.totalEvents }}</span>
              </div>
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Add / Edit Employee Dialog -->
    @if (showDialog()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto p-4">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4 my-4" dir="rtl">
          <h2 class="font-cairo font-bold text-lg">{{ editingId() ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد' }}</h2>

          <input [(ngModel)]="form.nameAr" placeholder="الاسم بالعربية *" class="input-field w-full"/>
          <input [(ngModel)]="form.name"   placeholder="الاسم بالإنجليزية" class="input-field w-full"/>
          <input [(ngModel)]="form.role"   placeholder="المنصب" class="input-field w-full"/>
          <input [(ngModel)]="form.phone"  placeholder="رقم الهاتف" class="input-field w-full"/>

          <div class="space-y-1">
            <input [(ngModel)]="form.email" type="email" placeholder="البريد الإلكتروني" class="input-field w-full"/>
            <p class="text-xs text-gray-400 font-cairo">سيتم إرسال رابط التقييم عند تعيينه كمدير</p>
          </div>

          <input [(ngModel)]="form.joinDate" type="date" class="input-field w-full"/>

          <select [(ngModel)]="form.specialization" class="input-field w-full">
            <option value="security_management">إدارة الأمن</option>
            <option value="crowd_management">إدارة الحشود</option>
            <option value="traffic_management">إدارة المرور</option>
            <option value="parking_access">إدارة المواقف</option>
            <option value="transportation">إدارة النقل</option>
            <option value="vip_transportation">نقل الشخصيات</option>
            <option value="close_protection">الحماية الشخصية</option>
            <option value="international_security">الأمن الدولي</option>
          </select>

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

    <!-- Resend confirmation toast -->
    @if (toast()) {
      <div class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm font-cairo px-5 py-3 rounded-xl shadow-xl z-50">
        {{ toast() }}
      </div>
    }
  `,
  styles: [`.input-field { border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; font-family:'Cairo',sans-serif; outline:none; width:100%; } .input-field:focus { border-color:hsl(42,80%,45%); }`]
})
export class EmployeesComponent {
  ds = inject(DataService);

  showDialog = signal(false);
  editingId  = signal<string | null>(null);
  saving     = signal(false);
  feedback   = signal('');
  feedbackOk = signal(false);
  toast      = signal('');

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
    if (!this.form.avatar) {
      this.form.avatar = this.form.nameAr.split(' ').map((w: string) => w[0]).join('').slice(0, 2);
    }
    this.saving.set(true);
    this.feedback.set('');
    try {
      const id = this.editingId();
      if (id) {
        await this.ds.updateEmployee(id, this.form);
        this.feedback.set('✓ تم حفظ التعديلات');
        this.feedbackOk.set(true);
        setTimeout(() => this.closeDialog(), 800);
      } else {
        await this.ds.addEmployee(this.form);
        this.closeDialog();
      }
    } catch {
      this.feedback.set('حدث خطأ أثناء الحفظ');
      this.feedbackOk.set(false);
    } finally {
      this.saving.set(false);
    }
  }

  async resend(emp: Employee) {
    try {
      const msg = await this.ds.resendToken(emp.id);
      this.showToast(msg || 'تم إرسال رابط التقييم');
    } catch {
      this.showToast('فشل إرسال الرابط — تحقق من البريد الإلكتروني');
    }
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 3000);
  }

  closeDialog() {
    this.showDialog.set(false);
    this.editingId.set(null);
    this.form = this.emptyForm();
    this.feedback.set('');
  }
}

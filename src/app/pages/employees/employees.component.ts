import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { RatingStarsComponent } from '../../components/rating-stars/rating-stars.component';
import { ServiceBadgeComponent } from '../../components/service-badge/service-badge.component';
import { ServiceType } from '../../models/data.models';

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
        <button (click)="showDialog.set(true)" class="px-4 py-2 rounded-lg text-sm font-cairo font-semibold text-white" style="background:hsl(42,80%,45%)">
          + إضافة موظف
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        @for (emp of ds.employees(); track emp.id) {
          <div class="card-glass rounded-xl p-5 hover:border-yellow-300 transition-all animate-fade-in">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                   style="background:hsl(42,80%,45%,0.15); color:hsl(42,80%,45%)">{{ emp.avatar }}</div>
              <div>
                <p class="font-cairo font-bold">{{ emp.nameAr }}</p>
                <p class="text-xs text-gray-400">{{ emp.role }}</p>
              </div>
            </div>
            <div class="space-y-3">
              <app-service-badge [type]="emp.specialization"/>
              <app-rating-stars [rating]="emp.avgRating" size="sm"/>
              <div class="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                <span>📅 {{ emp.joinDate }}</span>
                <span>📞 {{ emp.phone }}</span>
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

    @if (showDialog()) {
      <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 w-full max-w-md mx-4 space-y-4" dir="rtl">
          <h2 class="font-cairo font-bold text-lg">إضافة موظف جديد</h2>
          <input [(ngModel)]="form.name" placeholder="الاسم بالإنجليزية" class="input-field w-full"/>
          <input [(ngModel)]="form.nameAr" placeholder="الاسم بالعربية" class="input-field w-full"/>
          <input [(ngModel)]="form.role" placeholder="المنصب" class="input-field w-full"/>
          <input [(ngModel)]="form.phone" placeholder="رقم الهاتف" class="input-field w-full"/>
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
          <div class="flex gap-3 justify-end">
            <button (click)="showDialog.set(false)" class="px-4 py-2 text-sm border border-gray-200 rounded-lg font-cairo">إلغاء</button>
            <button (click)="submit()" class="px-4 py-2 text-sm text-white rounded-lg font-cairo font-bold" style="background:hsl(42,80%,45%)">حفظ</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`.input-field { border:1px solid #e5e7eb; border-radius:0.5rem; padding:0.5rem 0.75rem; font-size:0.875rem; font-family:'Cairo',sans-serif; outline:none; } .input-field:focus { border-color:hsl(42,80%,45%); }`]
})
export class EmployeesComponent {
  ds = inject(DataService);
  showDialog = signal(false);
  form = { name:'', nameAr:'', role:'', phone:'', joinDate:'', specialization:'security_management' as ServiceType };

  async submit() {
    if (!this.form.name || !this.form.nameAr) return;
    await this.ds.addEmployee({ ...this.form, avatar: this.form.nameAr.substring(0,2) });
    this.showDialog.set(false);
    this.form = { name:'', nameAr:'', role:'', phone:'', joinDate:'', specialization:'security_management' };
  }
}

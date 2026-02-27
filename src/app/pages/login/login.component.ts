import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
      <div class="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm space-y-6">

        <!-- Logo / Header -->
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-full mx-auto flex items-center justify-center text-2xl"
               style="background: hsl(42,80%,45%,0.12); color: hsl(42,80%,45%)">🛡️</div>
          <h1 class="text-xl font-cairo font-bold text-gray-800">نظام تقييم الموظفين</h1>
          <p class="text-sm text-gray-400 font-cairo">تسجيل دخول المدير</p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="submit()" class="space-y-4">
          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">اسم المستخدم</label>
            <input [(ngModel)]="username" name="username" type="text"
                   placeholder="admin"
                   class="input-field w-full" [class.border-red-300]="error()"/>
          </div>

          <div class="space-y-1">
            <label class="text-sm text-gray-500 font-cairo">كلمة المرور</label>
            <input [(ngModel)]="password" name="password" type="password"
                   placeholder="••••••••"
                   class="input-field w-full" [class.border-red-300]="error()"/>
          </div>

          @if (error()) {
            <p class="text-sm text-red-500 font-cairo text-center">{{ error() }}</p>
          }

          <button type="submit" [disabled]="loading()"
                  class="w-full py-2.5 rounded-lg text-white font-cairo font-bold text-sm transition-opacity disabled:opacity-60"
                  style="background: hsl(42,80%,45%)">
            {{ loading() ? 'جاري الدخول...' : 'دخول' }}
          </button>
        </form>

      </div>
    </div>
  `,
  styles: [`.input-field { border: 1px solid #e5e7eb; border-radius: 0.5rem; padding: 0.6rem 0.75rem; font-size: 0.875rem; font-family: 'Cairo', sans-serif; outline: none; width: 100%; transition: border-color 0.15s; } .input-field:focus { border-color: hsl(42,80%,45%); }`]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = signal(false);
  error = signal('');

  async submit() {
    if (!this.username || !this.password) {
      this.error.set('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.login(this.username, this.password);
      this.router.navigate(['/']);
    } catch {
      this.error.set('اسم المستخدم أو كلمة المرور غير صحيحة');
    } finally {
      this.loading.set(false);
    }
  }
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen gap-4" dir="rtl">
      <h1 class="text-6xl font-cairo font-bold" style="color:hsl(42,80%,45%)">404</h1>
      <p class="text-xl font-cairo text-gray-500">الصفحة غير موجودة</p>
      <a routerLink="/" class="px-6 py-2 text-white rounded-lg font-cairo" style="background:hsl(42,80%,45%)">العودة للرئيسية</a>
    </div>
  `
})
export class NotFoundComponent {}

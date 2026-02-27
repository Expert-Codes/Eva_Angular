import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LangService } from '../../services/lang.service';

interface NavItem { path: string; labelAr: string; labelEn: string; icon: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      class="fixed top-0 h-screen bg-white border-gray-200 flex flex-col transition-all duration-300 z-50"
      [class]="sideClass()">
      <!-- Header -->
      <div class="flex items-center gap-3 p-4 border-b border-gray-200">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style="background:hsl(42,80%,45%)">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
        </div>
        @if (!collapsed()) {
          <div>
            <h1 class="font-cairo font-bold text-sm text-gray-800">{{ lang.t('نظام التقييم', 'Evaluation System') }}</h1>
            <p class="text-xs text-gray-400">Event Staff Evaluation</p>
          </div>
        }
        <button (click)="collapsed.set(!collapsed())" class="ms-auto text-gray-400 hover:text-gray-600">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  [attr.d]="collapsed() ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'"/>
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 p-3 space-y-1">
        @for (item of navItems; track item.path) {
          <a [routerLink]="item.path" routerLinkActive="active"
             [routerLinkActiveOptions]="{exact: item.path === '/'}"
             class="sidebar-item" [title]="lang.isAr ? item.labelAr : item.labelEn">
            <span [innerHTML]="item.icon" class="w-5 h-5 flex-shrink-0"></span>
            @if (!collapsed()) {
              <span class="font-cairo">{{ lang.isAr ? item.labelAr : item.labelEn }}</span>
            }
          </a>
        }
      </nav>

      <!-- Footer: language toggle + copyright -->
      <div class="p-4 border-t border-gray-200 space-y-3">
        <!-- Language toggle -->
        <button (click)="lang.toggle()"
                class="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 transition-colors text-sm font-semibold text-gray-600"
                [title]="lang.isAr ? 'Switch to English' : 'التبديل إلى العربية'">
          <span class="text-base">🌐</span>
          @if (!collapsed()) {
            <span>{{ lang.isAr ? 'English' : 'عربي' }}</span>
          }
        </button>
        @if (!collapsed()) {
          <p class="text-xs text-gray-400 text-center font-cairo">© 2026 {{ lang.t('نظام تقييم الموظفين', 'Staff Evaluation System') }}</p>
        }
      </div>
    </aside>
  `
})
export class SidebarComponent {
  lang = inject(LangService);
  collapsed = signal(false);

  sideClass() {
    const w = this.collapsed() ? 'w-16' : 'w-64';
    const side = this.lang.isAr ? 'right-0 border-l' : 'left-0 border-r';
    return `${w} ${side}`;
  }

  navItems: NavItem[] = [
    { path: '/', labelAr: 'لوحة التحكم', labelEn: 'Dashboard',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>' },
    { path: '/events', labelAr: 'الفعاليات', labelEn: 'Events',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>' },
    { path: '/employees', labelAr: 'الموظفين', labelEn: 'Employees',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>' },
    { path: '/evaluations', labelAr: 'التقييمات', labelEn: 'Evaluations',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>' },
    { path: '/analytics', labelAr: 'التحليلات', labelEn: 'Analytics',
      icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>' },
  ];
}

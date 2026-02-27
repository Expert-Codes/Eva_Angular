import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50" dir="rtl">
      @if (showSidebar()) {
        <app-sidebar/>
        <main class="mr-64 min-h-screen p-6">
          <router-outlet/>
        </main>
      } @else {
        <router-outlet/>
      }
    </div>
  `,
})
export class App {
  private router = inject(Router);

  showSidebar = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const url = this.router.url;
        return !url.startsWith('/login') && !url.startsWith('/access');
      })
    ),
    { initialValue: true }
  );
}

import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { LangService } from './services/lang.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50" [attr.dir]="lang.isAr ? 'rtl' : 'ltr'">
      @if (showSidebar()) {
        <app-sidebar/>
        <main [class]="lang.isAr ? 'mr-64 min-h-screen p-6' : 'ml-64 min-h-screen p-6'">
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
  lang = inject(LangService);

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

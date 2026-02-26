import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-50" dir="rtl">
      <app-sidebar/>
      <main class="mr-64 min-h-screen p-6">
        <router-outlet/>
      </main>
    </div>
  `,
})
export class App {}

import { Component, Input } from '@angular/core';
import { SERVICE_LABELS_AR, ServiceType } from '../../models/data.models';

@Component({
  selector: 'app-service-badge',
  standalone: true,
  template: `
    <span class="inline-block px-2 py-0.5 rounded-md text-xs font-cairo font-medium"
          style="background:hsl(42,80%,45%,0.12); color:hsl(42,80%,35%)">
      {{ label }}
    </span>
  `
})
export class ServiceBadgeComponent {
  @Input() type: ServiceType = 'security_management';
  get label() { return SERVICE_LABELS_AR[this.type] ?? this.type; }
}

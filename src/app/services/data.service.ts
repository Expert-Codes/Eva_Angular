import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Employee, EventData, Evaluation, EventService } from '../models/data.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly BASE = 'http://localhost:3000/api';

  employees = signal<Employee[]>([]);
  events = signal<EventData[]>([]);
  evaluations = signal<Evaluation[]>([]);
  isLoading = signal(true);

  constructor(private http: HttpClient) {
    this.loadAll();
  }

  async loadAll() {
    try {
      const [emps, evts, evals] = await Promise.all([
        firstValueFrom(this.http.get<Employee[]>(`${this.BASE}/employees`)),
        firstValueFrom(this.http.get<EventData[]>(`${this.BASE}/events`)),
        firstValueFrom(this.http.get<Evaluation[]>(`${this.BASE}/evaluations`)),
      ]);
      this.employees.set(emps ?? []);
      this.events.set(evts ?? []);
      this.evaluations.set(evals ?? []);
    } catch (err) {
      console.error('Failed to load from API:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async addEmployee(emp: Omit<Employee, 'id' | 'avgRating' | 'totalEvents'>) {
    const created = await firstValueFrom(this.http.post<Employee>(`${this.BASE}/employees`, emp));
    this.employees.update(list => [created!, ...list]);
  }

  async addEvent(evt: Omit<EventData, 'id' | 'services'>) {
    const created = await firstValueFrom(this.http.post<EventData>(`${this.BASE}/events`, evt));
    this.events.update(list => [created!, ...list]);
  }

  async addServiceToEvent(eventId: string, service: Omit<EventService, 'id'>) {
    const updated = await firstValueFrom(this.http.post<EventData>(`${this.BASE}/events/${eventId}/services`, service));
    this.events.update(list => list.map(e => e.id === eventId ? updated! : e));
  }

  async addEmployeeToService(eventId: string, serviceId: string, employeeId: string) {
    const updated = await firstValueFrom(this.http.post<EventData>(`${this.BASE}/events/${eventId}/services/${serviceId}/employees`, { employeeId }));
    this.events.update(list => list.map(e => e.id === eventId ? updated! : e));
  }

  async addEvaluation(evaluation: Evaluation) {
    const created = await firstValueFrom(this.http.post<Evaluation>(`${this.BASE}/evaluations`, evaluation));
    this.evaluations.update(list => [created!, ...list]);
    const emp = await firstValueFrom(this.http.get<Employee>(`${this.BASE}/employees/${evaluation.employeeId}`));
    this.employees.update(list => list.map(e => e.id === emp!.id ? emp! : e));
  }
}

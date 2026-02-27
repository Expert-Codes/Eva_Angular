import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

const TOKEN_KEY = 'eva_admin_token';
const USERNAME_KEY = 'eva_admin_username';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly BASE = 'http://localhost:3000/api';

  private _token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private _username = signal<string | null>(localStorage.getItem(USERNAME_KEY));

  isLoggedIn = computed(() => !!this._token());
  username = computed(() => this._username());

  constructor(private http: HttpClient, private router: Router) {}

  async login(username: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ token: string; username: string }>(`${this.BASE}/auth/login`, { username, password })
    );
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USERNAME_KEY, res.username);
    this._token.set(res.token);
    this._username.set(res.username);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    this._token.set(null);
    this._username.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { AuthResponse, AuthUser, LoginRequest, PerfilNome } from '../models/api.models';

const ACCESS_TOKEN_KEY = 'nexus_access_token';
const REFRESH_TOKEN_KEY = 'nexus_refresh_token';
const USER_KEY = 'nexus_user';
const REMEMBER_KEY = 'nexus_remember';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = '/api/v1/auth';

  private readonly _user = signal<AuthUser | null>(this.readStoredUser());
  private readonly _accessToken = signal<string | null>(this.readStorage(ACCESS_TOKEN_KEY));

  readonly currentUser = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isAuthenticated = computed(() => !!this._accessToken() && !!this._user());
  readonly userRole = computed<PerfilNome | null>(() => this._user()?.perfil ?? null);

  hasRole(roles: PerfilNome[]): boolean {
    const current = this.userRole();
    return current !== null && roles.includes(current);
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload).pipe(
      tap((res) => this.persistSession(res, payload.lembrarAcesso)),
    );
  }

  refresh(): Observable<AuthResponse> {
    const refreshToken = this.readStorage(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return throwError(() => new Error('Refresh token ausente'));
    }
    const remember = localStorage.getItem(REMEMBER_KEY) === 'true';
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/refresh`, { refreshToken })
      .pipe(tap((res) => this.persistSession(res, remember)));
  }

  logout(): void {
    const refreshToken = this.readStorage(REFRESH_TOKEN_KEY);
    const req$ = refreshToken
      ? this.http.post<void>(`${this.baseUrl}/logout`, { refreshToken }).pipe(catchError(() => of(void 0)))
      : of(void 0);

    req$.subscribe(() => {
      this.clearSession();
      this.router.navigate(['/login']);
    });
  }

  loadMe(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/me`).pipe(
      tap((user) => this.updateCachedUser(user)),
    );
  }

  requestPasswordRecovery(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/recuperar-senha`, { email });
  }

  updateCachedUser(user: AuthUser): void {
    this._user.set(user);
    const storage = this.activeStorage();
    storage.setItem(USER_KEY, JSON.stringify(user));
  }

  ensureSessionLoaded(): Observable<boolean> {
    if (!this._accessToken()) {
      return of(false);
    }
    if (this._user()) {
      return of(true);
    }
    return this.loadMe().pipe(
      map(() => true),
      catchError(() => {
        this.clearSession();
        return of(false);
      }),
    );
  }

  clearSession(): void {
    this._accessToken.set(null);
    this._user.set(null);
    [localStorage, sessionStorage].forEach((s) => {
      s.removeItem(ACCESS_TOKEN_KEY);
      s.removeItem(REFRESH_TOKEN_KEY);
      s.removeItem(USER_KEY);
    });
    localStorage.removeItem(REMEMBER_KEY);
  }

  private persistSession(res: AuthResponse, remember: boolean): void {
    this.clearSession();
    const storage = remember ? localStorage : sessionStorage;
    if (remember) {
      localStorage.setItem(REMEMBER_KEY, 'true');
    }
    storage.setItem(ACCESS_TOKEN_KEY, res.accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
    storage.setItem(USER_KEY, JSON.stringify(res.usuario));
    this._accessToken.set(res.accessToken);
    this._user.set(res.usuario);
  }

  private activeStorage(): Storage {
    return localStorage.getItem(REMEMBER_KEY) === 'true' ? localStorage : sessionStorage;
  }

  private readStorage(key: string): string | null {
    return sessionStorage.getItem(key) ?? localStorage.getItem(key);
  }

  private readStoredUser(): AuthUser | null {
    const raw = this.readStorage(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }
}

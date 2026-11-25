import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuditoriaDto } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';
import { BreadcrumbService } from '../../core/services/breadcrumb.service';
import { LayoutStateService } from '../../core/services/layout-state.service';
import { RoleLabelPipe } from '../../shared/pipes/role-label.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    RoleLabelPipe,
  ],
  template: `
    <header class="top-header">
      <div class="left-section">
        <button
          mat-icon-button
          type="button"
          class="menu-toggle"
          aria-label="Alternar menu"
          (click)="menuToggle.emit()"
        >
          <mat-icon fontSet="material-icons-round">menu</mat-icon>
        </button>

        <nav class="breadcrumbs" aria-label="Breadcrumb">
          <a routerLink="/dashboard" class="crumb-home">
            <mat-icon fontSet="material-icons-round">home</mat-icon>
          </a>
          @for (crumb of breadcrumbService.breadcrumbs(); track crumb.url; let last = $last) {
            <mat-icon fontSet="material-icons-round" class="crumb-sep">chevron_right</mat-icon>
            @if (last) {
              <span class="crumb-current">{{ crumb.label }}</span>
            } @else {
              <a [routerLink]="crumb.url" class="crumb-link">{{ crumb.label }}</a>
            }
          }
        </nav>
      </div>

      <div class="right-section">
        <div class="search-box">
          <mat-icon fontSet="material-icons-round">search</mat-icon>
          <input
            type="search"
            placeholder="Pesquisar cursos, disciplinas..."
            [ngModel]="searchValue()"
            (ngModelChange)="onSearchChange($event)"
            (keydown.enter)="submitSearch()"
          />
        </div>

        <button
          mat-icon-button
          type="button"
          [matMenuTriggerFor]="notifMenu"
          aria-label="Notificações"
          (click)="loadNotifications()"
        >
          <mat-icon
            fontSet="material-icons-round"
            [matBadge]="notifications().length > 0 ? notifications().length : null"
            matBadgeColor="warn"
            matBadgeSize="small"
          >
            notifications_none
          </mat-icon>
        </button>

        <mat-menu #notifMenu="matMenu" class="notif-menu">
          <div class="menu-header">
            <span>Atividades Recentes</span>
          </div>
          <mat-divider></mat-divider>
          @if (notifications().length === 0) {
            <div class="notif-empty">Nenhuma atividade recente encontrada.</div>
          } @else {
            @for (item of notifications(); track item.id) {
              <div mat-menu-item class="notif-item" (click)="openNotificationTarget()">
                <mat-icon fontSet="material-icons-round">history</mat-icon>
                <div class="notif-body">
                  <div class="notif-title">{{ item.acao }} · {{ item.entidade }}</div>
                  <div class="notif-sub">{{ item.usuarioEmail || 'Sistema' }} · {{ item.criadoEm | date:'dd/MM HH:mm' }}</div>
                </div>
              </div>
            }
          }
        </mat-menu>

        <button class="user-trigger" type="button" [matMenuTriggerFor]="userMenu">
          <div class="avatar">{{ initials() }}</div>
          <div class="user-meta">
            <span class="user-name">{{ authService.currentUser()?.nome }}</span>
            <span class="user-role">{{ authService.currentUser()?.perfil | roleLabel }}</span>
          </div>
          <mat-icon fontSet="material-icons-round">expand_more</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <div class="user-menu-summary">
            <strong>{{ authService.currentUser()?.nome }}</strong>
            <span>{{ authService.currentUser()?.email }}</span>
          </div>
          <mat-divider></mat-divider>
          <a mat-menu-item routerLink="/perfil">
            <mat-icon fontSet="material-icons-round">person_outline</mat-icon>
            <span>Meu Perfil</span>
          </a>
          @if (authService.hasRole(['ADMIN'])) {
            <a mat-menu-item routerLink="/configuracoes">
              <mat-icon fontSet="material-icons-round">settings</mat-icon>
              <span>Configurações</span>
            </a>
          }
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="authService.logout()">
            <mat-icon fontSet="material-icons-round" color="warn">logout</mat-icon>
            <span>Sair do sistema</span>
          </button>
        </mat-menu>
      </div>
    </header>
  `,
  styles: [`
    .top-header {
      height: var(--header-height);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .left-section {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }
    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      overflow: hidden;
      white-space: nowrap;
    }
    .crumb-home {
      color: var(--color-text-secondary);
      display: inline-flex;
      align-items: center;
    }
    .crumb-home mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .crumb-sep { font-size: 16px; width: 16px; height: 16px; color: #94A3B8; }
    .crumb-link { color: var(--color-text-secondary); text-decoration: none; }
    .crumb-link:hover { color: var(--color-primary); }
    .crumb-current { color: var(--color-text-primary); font-weight: 600; }

    .right-section {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 6px 12px;
      width: 240px;
      color: var(--color-text-secondary);
    }
    .search-box mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .search-box input {
      border: none;
      background: transparent;
      outline: none;
      width: 100%;
      font-size: 13px;
      color: var(--color-text-primary);
    }
    .user-trigger {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 4px 8px;
      border: 1px solid var(--color-border);
      border-radius: 999px;
      background: var(--color-surface);
      cursor: pointer;
      transition: border-color 0.15s ease;
    }
    .user-trigger:hover { border-color: var(--color-primary); }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-primary);
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-meta {
      display: flex;
      flex-direction: column;
      text-align: left;
      line-height: 1.15;
    }
    .user-name { font-size: 13px; font-weight: 600; color: var(--color-text-primary); }
    .user-role { font-size: 11px; color: var(--color-text-secondary); }
    .menu-header { padding: 10px 16px; font-size: 13px; font-weight: 600; color: var(--color-text-primary); }
    .notif-empty { padding: 16px; font-size: 13px; color: var(--color-text-secondary); max-width: 280px; }
    .notif-item { height: auto !important; padding-top: 8px !important; padding-bottom: 8px !important; }
    .notif-body { display: flex; flex-direction: column; }
    .notif-title { font-size: 13px; font-weight: 500; color: var(--color-text-primary); }
    .notif-sub { font-size: 11px; color: var(--color-text-secondary); }
    .user-menu-summary {
      padding: 10px 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 12px;
      color: var(--color-text-secondary);
    }
    .user-menu-summary strong { font-size: 13px; color: var(--color-text-primary); }

    @media (max-width: 900px) {
      .search-box { display: none; }
      .user-meta { display: none; }
      .top-header { padding: 0 14px; }
    }
  `],
})
export class HeaderComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly breadcrumbService = inject(BreadcrumbService);
  private readonly layoutState = inject(LayoutStateService);
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly isMobile = input(false);
  readonly menuToggle = output<void>();

  readonly searchValue = this.layoutState.globalSearch;
  readonly notifications = signal<AuditoriaDto[]>([]);

  readonly initials = computed(() => {
    const name = this.authService.currentUser()?.nome ?? 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  onSearchChange(value: string): void {
    this.layoutState.globalSearch.set(value);
  }

  submitSearch(): void {
    const q = this.searchValue().trim();
    if (!q) return;
    this.router.navigate(['/cursos'], { queryParams: { q } });
  }

  loadNotifications(): void {
    this.http
      .get<AuditoriaDto[]>('/api/v1/dashboard/atividades')
      .pipe(catchError(() => of([])))
      .subscribe((items) => this.notifications.set(items.slice(0, 5)));
  }

  openNotificationTarget(): void {
    if (this.authService.hasRole(['ADMIN'])) {
      this.router.navigate(['/auditoria']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}

import { Component, computed, inject, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { PerfilNome } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  roles: PerfilNome[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatTooltipModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <div class="brand">
        <div class="brand-mark">
          <mat-icon fontSet="material-icons-round">shield</mat-icon>
        </div>
        @if (!collapsed()) {
          <div class="brand-text">
            <span class="brand-name">NexusAdmin</span>
            <span class="brand-sub">Gestão Corporativa</span>
          </div>
        }
      </div>

      <nav class="nav-list" aria-label="Menu principal">
        @for (item of visibleItems(); track item.route) {
          <a
            class="nav-item"
            [routerLink]="item.route"
            routerLinkActive="active"
            [matTooltip]="collapsed() ? item.label : ''"
            matTooltipPosition="right"
            (click)="navigate.emit()"
          >
            <mat-icon fontSet="material-icons-round">{{ item.icon }}</mat-icon>
            @if (!collapsed()) {
              <span>{{ item.label }}</span>
            }
          </a>
        }
      </nav>

      <div class="sidebar-footer">
        <button class="collapse-btn" type="button" (click)="toggleCollapse.emit()">
          <mat-icon fontSet="material-icons-round">
            {{ collapsed() ? 'chevron_right' : 'chevron_left' }}
          </mat-icon>
          @if (!collapsed()) {
            <span>Recolher menu</span>
          }
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100%;
      background-color: var(--color-primary-dark);
      color: #E2E8F0;
      display: flex;
      flex-direction: column;
      transition: width 0.2s ease;
      user-select: none;
    }
    .sidebar.collapsed {
      width: var(--sidebar-collapsed-width);
    }
    .brand {
      height: var(--header-height);
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .brand-mark {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background-color: var(--color-primary);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .brand-text {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .brand-name {
      font-size: 16px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -0.02em;
    }
    .brand-sub {
      font-size: 11px;
      color: #94A3B8;
    }
    .nav-list {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 8px;
      color: #CBD5E1;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.15s ease, color 0.15s ease;
      white-space: nowrap;
    }
    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 11px;
    }
    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
    }
    .nav-item.active {
      background-color: var(--color-primary);
      color: #FFFFFF;
    }
    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .collapse-btn {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: center;
      padding: 9px 12px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      background: transparent;
      color: #CBD5E1;
      font-size: 13px;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }
    .collapse-btn:hover {
      background-color: rgba(255, 255, 255, 0.08);
      color: #FFFFFF;
    }
  `],
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  readonly collapsed = input(false);
  readonly toggleCollapse = output<void>();
  readonly navigate = output<void>();

  private readonly items: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', roles: ['ADMIN', 'GESTOR', 'OPERADOR'] },
    { label: 'Usuários', route: '/usuarios', icon: 'group', roles: ['ADMIN', 'GESTOR'] },
    { label: 'Cursos', route: '/cursos', icon: 'school', roles: ['ADMIN', 'GESTOR', 'OPERADOR'] },
    { label: 'Disciplinas', route: '/disciplinas', icon: 'menu_book', roles: ['ADMIN', 'GESTOR', 'OPERADOR'] },
    { label: 'Auditoria', route: '/auditoria', icon: 'verified_user', roles: ['ADMIN'] },
    { label: 'Configurações', route: '/configuracoes', icon: 'settings', roles: ['ADMIN'] },
    { label: 'Meu Perfil', route: '/perfil', icon: 'person', roles: ['ADMIN', 'GESTOR', 'OPERADOR'] },
  ];

  readonly visibleItems = computed(() => {
    const role = this.authService.userRole();
    if (!role) return [];
    return this.items.filter((item) => item.roles.includes(role));
  });
}

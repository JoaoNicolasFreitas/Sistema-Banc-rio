import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { LayoutStateService } from '../../core/services/layout-state.service';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [MatSidenavModule, RouterOutlet, SidebarComponent, HeaderComponent, FooterComponent],
  template: `
    <mat-sidenav-container class="shell-container">
      <mat-sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="isMobile() ? layoutState.mobileMenuOpen() : true"
        (closedStart)="layoutState.closeMobileMenu()"
        class="shell-sidenav"
        [style.width.px]="!isMobile() && layoutState.sidebarCollapsed() ? 76 : 260"
      >
        <app-sidebar
          [collapsed]="!isMobile() && layoutState.sidebarCollapsed()"
          (toggleCollapse)="onSidebarCollapse()"
          (navigate)="onNavigate()"
        ></app-sidebar>
      </mat-sidenav>

      <mat-sidenav-content class="shell-content">
        <app-header
          [isMobile]="isMobile()"
          (menuToggle)="onHeaderMenuToggle()"
        ></app-header>

        <main class="main-area">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </main>

        <app-footer></app-footer>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .shell-container {
      height: 100vh;
      background-color: var(--color-bg);
    }
    .shell-sidenav {
      border-right: none;
      background-color: var(--color-primary-dark);
      transition: width 0.2s ease;
    }
    .shell-content {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background-color: var(--color-bg);
    }
    .main-area {
      flex: 1;
      padding: 24px;
    }
    .content-wrapper {
      max-width: 1440px;
      margin: 0 auto;
    }
    @media (max-width: 768px) {
      .main-area {
        padding: 16px;
      }
    }
  `],
})
export class AdminLayoutComponent implements OnInit {
  readonly layoutState = inject(LayoutStateService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = signal(false);

  ngOnInit(): void {
    this.breakpointObserver.observe(['(max-width: 960px)']).subscribe((state) => {
      this.isMobile.set(state.matches);
      if (!state.matches) {
        this.layoutState.closeMobileMenu();
      }
    });
  }

  onHeaderMenuToggle(): void {
    if (this.isMobile()) {
      this.layoutState.toggleMobileMenu();
    } else {
      this.layoutState.toggleSidebar();
    }
  }

  onSidebarCollapse(): void {
    if (this.isMobile()) {
      this.layoutState.closeMobileMenu();
    } else {
      this.layoutState.toggleSidebar();
    }
  }

  onNavigate(): void {
    if (this.isMobile()) {
      this.layoutState.closeMobileMenu();
    }
  }
}

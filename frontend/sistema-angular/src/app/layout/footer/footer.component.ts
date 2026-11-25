import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="app-footer">
      <span>NexusAdmin · Sistema Administrativo Web</span>
      <span>Spring Boot 3.5 + Angular 22 + MySQL 8.4</span>
    </footer>
  `,
  styles: [`
    .app-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border);
      background: var(--color-surface);
      color: var(--color-text-secondary);
      font-size: 12px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
    }
  `],
})
export class FooterComponent {}

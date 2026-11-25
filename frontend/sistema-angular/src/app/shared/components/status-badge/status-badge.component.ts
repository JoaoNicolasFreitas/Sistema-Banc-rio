import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `
    <span class="badge" [class]="variant()">
      <span class="dot"></span>
      {{ label() }}
    </span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.2;
      white-space: nowrap;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }
    .success { background: var(--color-success-soft); color: var(--color-success); }
    .danger { background: var(--color-error-soft); color: var(--color-error); }
    .warning { background: var(--color-warning-soft); color: #B45309; }
    .info { background: var(--color-primary-soft); color: var(--color-primary); }
    .neutral { background: #F1F5F9; color: var(--color-text-secondary); }
  `],
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly variant = input<'success' | 'danger' | 'warning' | 'info' | 'neutral'>('neutral');
}

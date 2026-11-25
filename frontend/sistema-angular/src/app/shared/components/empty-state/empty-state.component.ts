import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <mat-icon fontSet="material-icons-round">{{ icon() }}</mat-icon>
      </div>
      <h3>{{ title() }}</h3>
      <p>{{ description() }}</p>
      @if (actionLabel()) {
        <button mat-flat-button class="btn-primary-brand" (click)="action.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
      color: var(--color-text-secondary);
    }
    .empty-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      color: var(--color-primary);
    }
    .empty-icon mat-icon { font-size: 28px; width: 28px; height: 28px; }
    h3 { margin: 0 0 6px; font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
    p { margin: 0 0 18px; font-size: 14px; max-width: 420px; }
  `],
})
export class EmptyStateComponent {
  readonly icon = input('inbox');
  readonly title = input('Nenhum registro encontrado');
  readonly description = input('Tente ajustar os filtros ou adicione um novo item.');
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}

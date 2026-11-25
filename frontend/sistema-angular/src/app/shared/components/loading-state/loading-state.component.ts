import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-state',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="loading-state">
      <mat-spinner [diameter]="diameter()"></mat-spinner>
      <span>{{ message() }}</span>
    </div>
  `,
  styles: [`
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 14px;
      padding: 48px 24px;
      color: var(--color-text-secondary);
      font-size: 14px;
    }
  `],
})
export class LoadingStateComponent {
  readonly message = input('Carregando informações...');
  readonly diameter = input(36);
}

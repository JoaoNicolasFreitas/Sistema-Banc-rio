import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'primary' | 'danger' | 'warning';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="dialog-header">
        <div class="icon-wrap" [class]="data.tone || 'primary'">
          <mat-icon fontSet="material-icons-round">
            {{ data.tone === 'danger' ? 'warning_amber' : data.tone === 'warning' ? 'help_outline' : 'info' }}
          </mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title>{{ data.title }}</h2>
          <p class="dialog-message">{{ data.message }}</p>
        </div>
      </div>

      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="dialogRef.close(false)">
          {{ data.cancelLabel || 'Cancelar' }}
        </button>
        <button
          mat-flat-button
          [color]="data.tone === 'danger' ? 'warn' : 'primary'"
          (click)="dialogRef.close(true)"
        >
          {{ data.confirmLabel || 'Confirmar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog { padding: 4px; min-width: 340px; max-width: 460px; }
    .dialog-header { display: flex; gap: 16px; align-items: flex-start; padding: 16px 20px 8px; }
    .icon-wrap {
      width: 42px; height: 42px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .icon-wrap.primary { background: var(--color-primary-soft); color: var(--color-primary); }
    .icon-wrap.warning { background: var(--color-warning-soft); color: var(--color-warning); }
    .icon-wrap.danger { background: var(--color-error-soft); color: var(--color-error); }
    h2[mat-dialog-title] { margin: 0 0 6px; padding: 0; font-size: 17px; font-weight: 600; color: var(--color-text-primary); }
    .dialog-message { margin: 0; font-size: 14px; line-height: 1.5; color: var(--color-text-secondary); }
    mat-dialog-actions { padding: 12px 20px 16px; gap: 8px; }
  `],
})
export class ConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
}

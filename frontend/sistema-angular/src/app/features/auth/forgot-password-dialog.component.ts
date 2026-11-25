import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Recuperação de senha</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-dialog-content>
        <p class="desc">
          Informe o e-mail cadastrado. Registraremos a solicitação para atendimento administrativo.
        </p>
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>E-mail cadastrado</mat-label>
          <input matInput type="email" formControlName="email" placeholder="nome@empresa.com" />
          @if (form.controls.email.touched && form.controls.email.invalid) {
            <mat-error>Informe um e-mail válido.</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button type="button" (click)="dialogRef.close()">Cancelar</button>
        <button mat-flat-button class="btn-primary-brand" type="submit" [disabled]="loading()">
          {{ loading() ? 'Enviando...' : 'Solicitar' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .desc { margin: 0 0 16px; font-size: 14px; color: var(--color-text-secondary); }
    .full-width { width: 100%; }
  `],
})
export class ForgotPasswordDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ForgotPasswordDialogComponent>);
  private readonly data = inject<{ email?: string } | null>(MAT_DIALOG_DATA, { optional: true });
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: [this.data?.email ?? '', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.authService
      .requestPasswordRecovery(this.form.controls.email.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => {
          this.toast.info(res.message);
          this.dialogRef.close();
        },
        error: () => {
          this.toast.error('Erro ao registrar solicitação de recuperação.');
        },
      });
  }
}

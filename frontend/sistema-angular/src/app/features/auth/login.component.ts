import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiErrorResponse } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { ForgotPasswordDialogComponent } from './forgot-password-dialog.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-page">
      <div class="login-panel">
        <div class="brand-header">
          <div class="brand-logo">
            <mat-icon fontSet="material-icons-round">shield</mat-icon>
          </div>
          <div>
            <h1>NexusAdmin</h1>
            <p>Portal Administrativo Corporativo</p>
          </div>
        </div>

        <div class="login-card surface-card">
          <h2>Entrar no sistema</h2>
          <p class="subtitle">Informe suas credenciais de acesso para continuar.</p>

          @if (errorMessage()) {
            <div class="alert-error" role="alert">
              <mat-icon fontSet="material-icons-round">error_outline</mat-icon>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
            <mat-form-field appearance="outline">
              <mat-label>E-mail</mat-label>
              <mat-icon matPrefix fontSet="material-icons-round">mail_outline</mat-icon>
              <input matInput type="email" formControlName="email" placeholder="nome@empresa.com" autocomplete="email" />
              @if (form.controls.email.touched && form.controls.email.hasError('required')) {
                <mat-error>O e-mail é obrigatório.</mat-error>
              } @else if (form.controls.email.touched && form.controls.email.hasError('email')) {
                <mat-error>Informe um e-mail válido.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Senha</mat-label>
              <mat-icon matPrefix fontSet="material-icons-round">lock_outline</mat-icon>
              <input
                matInput
                [type]="hidePassword() ? 'password' : 'text'"
                formControlName="senha"
                autocomplete="current-password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                [attr.aria-label]="hidePassword() ? 'Mostrar senha' : 'Ocultar senha'"
                (click)="hidePassword.set(!hidePassword())"
              >
                <mat-icon fontSet="material-icons-round">
                  {{ hidePassword() ? 'visibility' : 'visibility_off' }}
                </mat-icon>
              </button>
              @if (form.controls.senha.touched && form.controls.senha.hasError('required')) {
                <mat-error>A senha é obrigatória.</mat-error>
              }
            </mat-form-field>

            <div class="form-options">
              <mat-checkbox formControlName="lembrarAcesso" color="primary">
                Lembrar acesso
              </mat-checkbox>
              <button type="button" class="forgot-link" (click)="openForgotPassword()">
                Esqueci minha senha
              </button>
            </div>

            <button
              mat-flat-button
              type="submit"
              class="btn-primary-brand submit-btn"
              [disabled]="loading()"
            >
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
                <span>Autenticando...</span>
              } @else {
                <span>Entrar</span>
              }
            </button>
          </form>
        </div>

        <p class="security-note">
          Conexão protegida via JWT e controle de acesso baseado em perfis.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      background-color: var(--color-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }
    .login-panel {
      width: 100%;
      max-width: 430px;
    }
    .brand-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 24px;
      justify-content: center;
    }
    .brand-logo {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      background: var(--color-primary-dark);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-logo mat-icon { font-size: 26px; width: 26px; height: 26px; }
    .brand-header h1 { margin: 0; font-size: 22px; font-weight: 700; color: var(--color-text-primary); }
    .brand-header p { margin: 2px 0 0; font-size: 13px; color: var(--color-text-secondary); }

    .login-card {
      padding: 32px;
    }
    .login-card h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .subtitle {
      margin: 6px 0 22px;
      font-size: 14px;
      color: var(--color-text-secondary);
    }
    .alert-error {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      margin-bottom: 18px;
      border-radius: 8px;
      background: var(--color-error-soft);
      color: var(--color-error);
      font-size: 13px;
      font-weight: 500;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .form-options {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 2px 0 14px;
    }
    .forgot-link {
      border: none;
      background: transparent;
      color: var(--color-primary);
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      padding: 4px;
    }
    .forgot-link:hover { text-decoration: underline; }
    .submit-btn {
      height: 44px;
      font-size: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .security-note {
      margin: 18px 0 0;
      text-align: center;
      font-size: 12px;
      color: var(--color-text-secondary);
    }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);

  readonly hidePassword = signal(true);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
    lembrarAcesso: [false],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.toast.success('Bem-vindo ao NexusAdmin.');
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          const apiErr = err?.error as ApiErrorResponse | undefined;
          this.errorMessage.set(apiErr?.message || 'Não foi possível autenticar. Verifique suas credenciais.');
        },
      });
  }

  openForgotPassword(): void {
    this.dialog.open(ForgotPasswordDialogComponent, {
      width: '420px',
      data: { email: this.form.controls.email.value },
    });
  }
}

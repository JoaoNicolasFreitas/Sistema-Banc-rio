import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';
import { ApiErrorResponse, AuthUser } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { RoleLabelPipe } from '../../shared/pipes/role-label.pipe';

function passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
  const nova = group.get('novaSenha')?.value;
  const confirmacao = group.get('confirmacaoSenha')?.value;
  return nova && confirmacao && nova !== confirmacao ? { mismatch: true } : null;
}

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    RoleLabelPipe,
  ],
  template: `
    <app-page-header
      title="Meu Perfil"
      subtitle="Gerencie suas informações cadastrais e credenciais de segurança."
    ></app-page-header>

    <div class="perfil-grid">
      <section class="surface-card card-pad summary-card">
        <div class="profile-hero">
          <div class="hero-avatar">{{ initials() }}</div>
          <div>
            <h2>{{ user()?.nome }}</h2>
            <p>{{ user()?.email }}</p>
            <div class="badges">
              <app-status-badge [label]="user()?.perfil | roleLabel" variant="info"></app-status-badge>
              <app-status-badge
                [label]="user()?.ativo ? 'Conta Ativa' : 'Inativa'"
                [variant]="user()?.ativo ? 'success' : 'danger'"
              ></app-status-badge>
            </div>
          </div>
        </div>

        <div class="meta-list">
          <div class="meta-item">
            <span class="meta-label">Perfil de acesso</span>
            <strong>{{ user()?.perfil | roleLabel }}</strong>
          </div>
          <div class="meta-item">
            <span class="meta-label">Data de criação da conta</span>
            <strong>{{ user()?.criadoEm | date:'dd/MM/yyyy HH:mm' }}</strong>
          </div>
          <div class="meta-item">
            <span class="meta-label">Último acesso</span>
            <strong>{{ user()?.ultimoAcessoEm ? (user()?.ultimoAcessoEm | date:'dd/MM/yyyy HH:mm') : 'Sessão atual' }}</strong>
          </div>
        </div>
      </section>

      <div class="forms-col">
        <section class="surface-card card-pad">
          <h3>Dados Pessoais</h3>
          <p class="section-desc">Atualize seu nome completo e endereço de e-mail.</p>

          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="form-stack">
            <mat-form-field appearance="outline">
              <mat-label>Nome completo</mat-label>
              <input matInput formControlName="nome" />
              @if (profileForm.controls.nome.touched && profileForm.controls.nome.invalid) {
                <mat-error>Informe um nome com pelo menos 3 caracteres.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>E-mail</mat-label>
              <input matInput type="email" formControlName="email" />
              @if (profileForm.controls.email.touched && profileForm.controls.email.invalid) {
                <mat-error>Informe um e-mail válido.</mat-error>
              }
            </mat-form-field>

            <div class="actions">
              <button mat-flat-button class="btn-primary-brand" type="submit" [disabled]="savingProfile()">
                {{ savingProfile() ? 'Salvando...' : 'Salvar alterações' }}
              </button>
            </div>
          </form>
        </section>

        <section class="surface-card card-pad">
          <h3>Alterar Senha</h3>
          <p class="section-desc">Utilize uma senha forte com no mínimo 8 caracteres.</p>

          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="form-stack">
            <mat-form-field appearance="outline">
              <mat-label>Senha atual</mat-label>
              <input matInput [type]="hideCurrent() ? 'password' : 'text'" formControlName="senhaAtual" />
              <button mat-icon-button matSuffix type="button" (click)="hideCurrent.set(!hideCurrent())">
                <mat-icon fontSet="material-icons-round">{{ hideCurrent() ? 'visibility' : 'visibility_off' }}</mat-icon>
              </button>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nova senha</mat-label>
              <input matInput [type]="hideNew() ? 'password' : 'text'" formControlName="novaSenha" />
              <button mat-icon-button matSuffix type="button" (click)="hideNew.set(!hideNew())">
                <mat-icon fontSet="material-icons-round">{{ hideNew() ? 'visibility' : 'visibility_off' }}</mat-icon>
              </button>
              @if (passwordForm.controls.novaSenha.touched && passwordForm.controls.novaSenha.hasError('minlength')) {
                <mat-error>Mínimo de 8 caracteres.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Confirmar nova senha</mat-label>
              <input matInput [type]="hideNew() ? 'password' : 'text'" formControlName="confirmacaoSenha" />
              @if (passwordForm.hasError('mismatch') && passwordForm.controls.confirmacaoSenha.touched) {
                <mat-error>As senhas não conferem.</mat-error>
              }
            </mat-form-field>

            <div class="actions">
              <button mat-flat-button color="primary" class="btn-primary-brand" type="submit" [disabled]="savingPassword()">
                {{ savingPassword() ? 'Atualizando...' : 'Atualizar senha' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .perfil-grid {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 20px;
      align-items: start;
    }
    .card-pad { padding: 24px; }
    .profile-hero {
      display: flex;
      gap: 16px;
      align-items: center;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--color-border);
    }
    .hero-avatar {
      width: 60px;
      height: 60px;
      border-radius: 14px;
      background: var(--color-primary);
      color: #FFFFFF;
      font-size: 20px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .profile-hero h2 { margin: 0; font-size: 18px; font-weight: 700; }
    .profile-hero p { margin: 2px 0 8px; font-size: 13px; color: var(--color-text-secondary); }
    .badges { display: flex; gap: 8px; flex-wrap: wrap; }
    .meta-list {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .meta-label { font-size: 12px; color: var(--color-text-secondary); }
    .meta-item strong { font-size: 14px; color: var(--color-text-primary); }
    .forms-col { display: flex; flex-direction: column; gap: 20px; }
    h3 { margin: 0; font-size: 17px; font-weight: 600; }
    .section-desc { margin: 4px 0 18px; font-size: 13px; color: var(--color-text-secondary); }
    .form-stack { display: flex; flex-direction: column; gap: 8px; }
    .actions { display: flex; justify-content: flex-end; margin-top: 4px; }

    @media (max-width: 960px) {
      .perfil-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class PerfilComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly user = this.authService.currentUser;
  readonly savingProfile = signal(false);
  readonly savingPassword = signal(false);
  readonly hideCurrent = signal(true);
  readonly hideNew = signal(true);

  readonly profileForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
  });

  readonly passwordForm = this.fb.nonNullable.group(
    {
      senhaAtual: ['', [Validators.required]],
      novaSenha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmacaoSenha: ['', [Validators.required]],
    },
    { validators: passwordsMatchValidator },
  );

  ngOnInit(): void {
    this.authService.loadMe().subscribe({
      next: (u) => {
        this.profileForm.patchValue({ nome: u.nome, email: u.email });
      },
      error: () => {
        const u = this.user();
        if (u) this.profileForm.patchValue({ nome: u.nome, email: u.email });
      },
    });
  }

  initials(): string {
    const name = this.user()?.nome ?? 'US';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.savingProfile.set(true);
    this.http
      .put<AuthUser>('/api/v1/perfil', this.profileForm.getRawValue())
      .pipe(finalize(() => this.savingProfile.set(false)))
      .subscribe({
        next: (updated) => {
          this.authService.updateCachedUser(updated);
          this.toast.success('Dados do perfil atualizados com sucesso.');
        },
        error: (err) => {
          const apiErr = err?.error as ApiErrorResponse | undefined;
          this.toast.error(apiErr?.message || 'Erro ao atualizar perfil.');
        },
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.savingPassword.set(true);
    const { senhaAtual, novaSenha } = this.passwordForm.getRawValue();
    this.http
      .patch<void>('/api/v1/perfil/senha', { senhaAtual, novaSenha })
      .pipe(finalize(() => this.savingPassword.set(false)))
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.toast.success('Senha alterada com sucesso.');
        },
        error: (err) => {
          const apiErr = err?.error as ApiErrorResponse | undefined;
          this.toast.error(apiErr?.message || 'Erro ao alterar senha.');
        },
      });
  }
}

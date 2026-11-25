import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageResponse, UsuarioDto } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, PageHeaderComponent],
  template: `
    <app-page-header title="Usuários" subtitle="Cadastro, perfis, pesquisa e status das contas.">
      <button mat-flat-button class="btn-primary-brand" type="button" (click)="showForm.set(!showForm())">
        <mat-icon fontSet="material-icons-round">person_add</mat-icon>
        Novo usuário
      </button>
    </app-page-header>
    @if (showForm()) {
      <section class="surface-card form-card">
        <form (ngSubmit)="criar()" class="form-grid">
          <input [(ngModel)]="novo.nome" name="nome" placeholder="Nome completo" required />
          <input [(ngModel)]="novo.email" name="email" type="email" placeholder="E-mail" required />
          <input [(ngModel)]="novo.senha" name="senha" type="password" placeholder="Senha (mín. 8 caracteres)" required />
          <select [(ngModel)]="novo.perfil" name="perfil">
            <option value="OPERADOR">Operador</option><option value="GESTOR">Gestor</option><option value="ADMIN">Administrador</option>
          </select>
          <label><input type="checkbox" [(ngModel)]="novo.ativo" name="ativo" /> Conta ativa</label>
          <button mat-flat-button class="btn-primary-brand" type="submit">Cadastrar</button>
        </form>
      </section>
    }
    <section class="surface-card table-card">
      <div class="toolbar"><input [(ngModel)]="busca" name="busca" (ngModelChange)="carregar()" placeholder="Pesquisar por nome ou e-mail" /></div>
      @if (dados().length === 0) { <p class="empty">Nenhum usuário encontrado.</p> } @else {
        <div class="table-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>@for (u of dados(); track u.id) { <tr><td>{{u.nome}}</td><td>{{u.email}}</td><td>{{u.perfil}}</td>
            <td><span [class]="u.ativo ? 'status active' : 'status inactive'">{{u.ativo ? 'Ativo' : 'Inativo'}}</span></td>
            <td><button type="button" class="text-action" (click)="alternar(u)">{{u.ativo ? 'Desativar' : 'Ativar'}}</button></td>
          </tr>}</tbody>
        </table></div>
      }
    </section>
  `,
  styles: [`.form-card,.table-card{padding:20px;margin-bottom:16px}.form-grid{display:grid;grid-template-columns:repeat(5,1fr) auto;gap:10px;align-items:center}.form-grid input,.form-grid select,.toolbar input{height:40px;border:1px solid var(--color-border);border-radius:8px;padding:0 10px}.toolbar{margin-bottom:12px}.toolbar input{width:min(420px,100%)}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px;border-bottom:1px solid var(--color-border)}th{font-size:12px;color:var(--color-text-secondary);text-transform:uppercase}.status{padding:4px 8px;border-radius:999px;font-size:12px}.active{background:#DCFCE7;color:#166534}.inactive{background:#FEE2E2;color:#991B1B}.text-action{border:0;background:none;color:var(--color-primary);cursor:pointer}.empty{padding:20px;text-align:center;color:var(--color-text-secondary)}.table-wrap{overflow-x:auto}@media(max-width:960px){.form-grid{grid-template-columns:1fr}}`],
})
export class UsuariosComponent implements OnInit {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  dados = signal<UsuarioDto[]>([]);
  showForm = signal(false);
  busca = '';
  novo = { nome: '', email: '', senha: '', perfil: 'OPERADOR', ativo: true };
  ngOnInit() { this.carregar(); }
  carregar() {
    this.http.get<PageResponse<UsuarioDto>>('/api/v1/usuarios', { params: { busca: this.busca, page: '0', size: '20' } })
      .subscribe(r => this.dados.set(r.content));
  }
  criar() {
    this.http.post<UsuarioDto>('/api/v1/usuarios', this.novo).subscribe({
      next: () => { this.toast.success('Usuário cadastrado.'); this.showForm.set(false); this.novo = { nome: '', email: '', senha: '', perfil: 'OPERADOR', ativo: true }; this.carregar(); },
      error: () => this.toast.error('Não foi possível cadastrar o usuário.')
    });
  }
  alternar(u: UsuarioDto) {
    this.http.patch<UsuarioDto>(`/api/v1/usuarios/${u.id}/status`, { ativo: !u.ativo }).subscribe({
      next: () => { this.toast.success('Status atualizado.'); this.carregar(); }
    });
  }
}

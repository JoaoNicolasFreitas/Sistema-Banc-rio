import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CursoDto, PageResponse } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, PageHeaderComponent],
  template: `
    <app-page-header title="Cursos" subtitle="Catálogo acadêmico e associação de disciplinas.">
      <button mat-flat-button class="btn-primary-brand" type="button" (click)="showForm.set(!showForm())"><mat-icon fontSet="material-icons-round">add</mat-icon>Novo curso</button>
    </app-page-header>
    @if (showForm()) { <section class="surface-card form-card"><form (ngSubmit)="salvar()" class="form-grid">
      <input [(ngModel)]="form.nome" name="nome" placeholder="Nome do curso" required />
      <input [(ngModel)]="form.codigo" name="codigo" placeholder="Código" required />
      <input [(ngModel)]="form.descricao" name="descricao" placeholder="Descrição" />
      <label><input type="checkbox" [(ngModel)]="form.ativo" name="ativo" /> Ativo</label>
      <button mat-flat-button class="btn-primary-brand" type="submit">Cadastrar</button>
    </form></section> }
    <section class="surface-card table-card"><div class="toolbar"><input [(ngModel)]="busca" name="busca" (ngModelChange)="carregar()" placeholder="Pesquisar cursos" /></div>
      @if (dados().length === 0) { <p class="empty">Nenhum curso encontrado.</p> } @else {
      <div class="table-wrap"><table><thead><tr><th>Nome</th><th>Código</th><th>Disciplinas</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody>@for (c of dados(); track c.id) { <tr><td>{{c.nome}}</td><td>{{c.codigo}}</td><td>{{c.disciplinas.length}}</td><td>{{c.ativo ? 'Ativo' : 'Inativo'}}</td>
      <td><button type="button" class="text-action" (click)="excluir(c)">Excluir</button></td></tr> }</tbody></table></div>}</section>
  `,
  styles: [`.form-card,.table-card{padding:20px;margin-bottom:16px}.form-grid{display:grid;grid-template-columns:2fr 1fr 2fr auto auto;gap:10px}.form-grid input,.toolbar input{height:40px;border:1px solid var(--color-border);border-radius:8px;padding:0 10px}.toolbar{margin-bottom:12px}.toolbar input{width:min(420px,100%)}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px;border-bottom:1px solid var(--color-border)}th{font-size:12px;color:var(--color-text-secondary);text-transform:uppercase}.text-action{border:0;background:none;color:#DC2626;cursor:pointer}.empty{padding:20px;text-align:center;color:var(--color-text-secondary)}.table-wrap{overflow-x:auto}@media(max-width:960px){.form-grid{grid-template-columns:1fr}}`],
})
export class CursosComponent implements OnInit {
  private http = inject(HttpClient); private toast = inject(ToastService);
  dados = signal<CursoDto[]>([]); showForm = signal(false); busca = '';
  form = { nome: '', codigo: '', descricao: '', ativo: true, disciplinaIds: [] as number[] };
  ngOnInit() { this.carregar(); }
  carregar() { this.http.get<PageResponse<CursoDto>>('/api/v1/cursos', { params: { busca: this.busca, page: '0', size: '20' } }).subscribe(r => this.dados.set(r.content)); }
  salvar() { this.http.post<CursoDto>('/api/v1/cursos', this.form).subscribe({ next: () => { this.toast.success('Curso cadastrado.'); this.showForm.set(false); this.form = { nome: '', codigo: '', descricao: '', ativo: true, disciplinaIds: [] }; this.carregar(); }, error: () => this.toast.error('Não foi possível cadastrar o curso.') }); }
  excluir(c: CursoDto) { if (!confirm(`Excluir o curso ${c.nome}?`)) return; this.http.delete(`/api/v1/cursos/${c.id}`).subscribe({ next: () => { this.toast.success('Curso excluído.'); this.carregar(); } }); }
}

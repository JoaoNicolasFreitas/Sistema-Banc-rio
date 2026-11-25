import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DisciplinaDto, PageResponse } from '../../core/models/api.models';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-disciplinas',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, PageHeaderComponent],
  template: `
    <app-page-header title="Disciplinas" subtitle="Cadastro, carga horária e associação a cursos.">
      <button mat-flat-button class="btn-primary-brand" type="button" (click)="showForm.set(!showForm())"><mat-icon fontSet="material-icons-round">add</mat-icon>Nova disciplina</button>
    </app-page-header>
    @if (showForm()) { <section class="surface-card form-card"><form (ngSubmit)="salvar()" class="form-grid">
      <input [(ngModel)]="form.nome" name="nome" placeholder="Nome da disciplina" required />
      <input [(ngModel)]="form.codigo" name="codigo" placeholder="Código" required />
      <input [(ngModel)]="form.descricao" name="descricao" placeholder="Descrição" />
      <input [(ngModel)]="form.cargaHoraria" name="carga" type="number" min="1" placeholder="Carga horária" required />
      <label><input type="checkbox" [(ngModel)]="form.ativo" name="ativo" /> Ativa</label>
      <button mat-flat-button class="btn-primary-brand" type="submit">Cadastrar</button>
    </form></section> }
    <section class="surface-card table-card"><div class="toolbar"><input [(ngModel)]="busca" name="busca" (ngModelChange)="carregar()" placeholder="Pesquisar disciplinas" /></div>
      @if (dados().length === 0) { <p class="empty">Nenhuma disciplina encontrada.</p> } @else {
      <div class="table-wrap"><table><thead><tr><th>Nome</th><th>Código</th><th>Carga</th><th>Cursos</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody>@for (d of dados(); track d.id) { <tr><td>{{d.nome}}</td><td>{{d.codigo}}</td><td>{{d.cargaHoraria}}h</td><td>{{d.cursos.length}}</td><td>{{d.ativo ? 'Ativa' : 'Inativa'}}</td>
      <td><button type="button" class="text-action" (click)="excluir(d)">Excluir</button></td></tr> }</tbody></table></div>}</section>
  `,
  styles: [`.form-card,.table-card{padding:20px;margin-bottom:16px}.form-grid{display:grid;grid-template-columns:2fr 1fr 2fr 1fr auto auto;gap:10px}.form-grid input,.toolbar input{height:40px;border:1px solid var(--color-border);border-radius:8px;padding:0 10px}.toolbar{margin-bottom:12px}.toolbar input{width:min(420px,100%)}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px;border-bottom:1px solid var(--color-border)}th{font-size:12px;color:var(--color-text-secondary);text-transform:uppercase}.text-action{border:0;background:none;color:#DC2626;cursor:pointer}.empty{padding:20px;text-align:center;color:var(--color-text-secondary)}.table-wrap{overflow-x:auto}@media(max-width:960px){.form-grid{grid-template-columns:1fr}}`],
})
export class DisciplinasComponent implements OnInit {
  private http = inject(HttpClient); private toast = inject(ToastService);
  dados = signal<DisciplinaDto[]>([]); showForm = signal(false); busca = '';
  form = { nome: '', codigo: '', descricao: '', cargaHoraria: 60, ativo: true, cursoIds: [] as number[] };
  ngOnInit() { this.carregar(); }
  carregar() { this.http.get<PageResponse<DisciplinaDto>>('/api/v1/disciplinas', { params: { busca: this.busca, page: '0', size: '20' } }).subscribe(r => this.dados.set(r.content)); }
  salvar() { this.http.post<DisciplinaDto>('/api/v1/disciplinas', this.form).subscribe({ next: () => { this.toast.success('Disciplina cadastrada.'); this.showForm.set(false); this.form = { nome: '', codigo: '', descricao: '', cargaHoraria: 60, ativo: true, cursoIds: [] }; this.carregar(); }, error: () => this.toast.error('Não foi possível cadastrar a disciplina.') }); }
  excluir(d: DisciplinaDto) { if (!confirm(`Excluir a disciplina ${d.nome}?`)) return; this.http.delete(`/api/v1/disciplinas/${d.id}`).subscribe({ next: () => { this.toast.success('Disciplina excluída.'); this.carregar(); } }); }
}

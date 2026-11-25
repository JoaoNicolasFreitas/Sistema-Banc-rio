import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AuditoriaDto, PageResponse } from '../../core/models/api.models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, DatePipe, PageHeaderComponent],
  template: `
    <app-page-header title="Auditoria" subtitle="Registro protegido das operações administrativas."></app-page-header>
    <section class="surface-card table-card">
      @if (dados().length === 0) { <p class="empty">Nenhuma atividade registrada.</p> } @else {
      <div class="table-wrap"><table><thead><tr><th>Data</th><th>Usuário responsável</th><th>Ação</th><th>Entidade</th><th>Detalhes</th><th>Origem</th></tr></thead>
      <tbody>@for (a of dados(); track a.id) { <tr><td>{{a.criadoEm | date:'dd/MM/yyyy HH:mm'}}</td><td>{{a.usuarioEmail || '-'}}</td><td>{{a.acao}}</td><td>{{a.entidade}} {{a.entidadeId ? '#' + a.entidadeId : ''}}</td><td>{{a.detalhes || '-'}}</td><td>{{a.ipOrigem || '-'}}</td></tr> }</tbody></table></div>}</section>
  `,
  styles: [`.table-card{padding:20px}.empty{padding:20px;text-align:center;color:var(--color-text-secondary)}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px;border-bottom:1px solid var(--color-border)}th{font-size:12px;color:var(--color-text-secondary);text-transform:uppercase}.table-wrap{overflow-x:auto}`],
})
export class AuditoriaComponent implements OnInit {
  private http = inject(HttpClient);
  dados = signal<AuditoriaDto[]>([]);
  ngOnInit() { this.http.get<PageResponse<AuditoriaDto>>('/api/v1/auditoria', { params: { page: '0', size: '50' } }).subscribe(r => this.dados.set(r.content)); }
}

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ConfiguracaoDto } from '../../core/models/api.models';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [CommonModule, PageHeaderComponent],
  template: `
    <app-page-header title="Configurações" subtitle="Parâmetros gerais e preferências administrativas do sistema."></app-page-header>
    <section class="surface-card config-grid">
      @if (dados().length === 0) { <p class="empty">Nenhuma configuração cadastrada.</p> } @else {
        @for (c of dados(); track c.id) { <article><span>{{c.categoria}}</span><strong>{{c.chave}}</strong><p>{{c.descricao || 'Sem descrição'}}</p><code>{{c.valor}}</code></article> }
      }
    </section>
  `,
  styles: [`.config-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:20px}.config-grid article{border:1px solid var(--color-border);border-radius:10px;padding:16px}.config-grid span{display:block;font-size:11px;text-transform:uppercase;color:var(--color-text-secondary)}.config-grid strong{display:block;margin-top:6px}.config-grid p{font-size:13px;color:var(--color-text-secondary)}.config-grid code{display:block;background:#F1F5F9;padding:8px;border-radius:6px;overflow-wrap:anywhere}.empty{grid-column:1/-1;text-align:center;color:var(--color-text-secondary)}@media(max-width:960px){.config-grid{grid-template-columns:1fr}}`],
})
export class ConfiguracoesComponent implements OnInit {
  private http = inject(HttpClient);
  dados = signal<ConfiguracaoDto[]>([]);
  ngOnInit() { this.http.get<ConfiguracaoDto[]>('/api/v1/configuracoes').subscribe(r => this.dados.set(r)); }
}

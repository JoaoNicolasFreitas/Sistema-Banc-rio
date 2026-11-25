import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { finalize, forkJoin } from 'rxjs';
import { AuditoriaDto, DashboardResumoDto } from '../../core/models/api.models';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { LoadingStateComponent } from '../../shared/components/loading-state/loading-state.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { RoleLabelPipe } from '../../shared/pipes/role-label.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    BaseChartDirective,
    PageHeaderComponent,
    LoadingStateComponent,
    EmptyStateComponent,
    StatusBadgeComponent,
    RoleLabelPipe,
  ],
  template: `
    <app-page-header
      title="Dashboard"
      subtitle="Visão consolidada de usuários, catálogo acadêmico e trilha operacional."
    >
      <button mat-stroked-button type="button" (click)="loadData()" [disabled]="loading()">
        <mat-icon fontSet="material-icons-round">refresh</mat-icon>
        Atualizar
      </button>
    </app-page-header>

    @if (loading() && !resumo()) {
      <div class="surface-card">
        <app-loading-state message="Carregando indicadores do painel..."></app-loading-state>
      </div>
    } @else if (resumo(); as data) {
      <section class="kpi-grid">
        <article class="surface-card kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Total de Usuários</span>
            <div class="kpi-icon blue">
              <mat-icon fontSet="material-icons-round">group</mat-icon>
            </div>
          </div>
          <div class="kpi-value">{{ data.totalUsuarios }}</div>
          <div class="kpi-foot">Contas registradas no sistema</div>
        </article>

        <article class="surface-card kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Usuários Ativos</span>
            <div class="kpi-icon green">
              <mat-icon fontSet="material-icons-round">verified_user</mat-icon>
            </div>
          </div>
          <div class="kpi-value">{{ data.usuariosAtivos }}</div>
          <div class="kpi-foot">{{ data.taxaUsuariosAtivosPercent | number:'1.1-1' }}% da base ativa</div>
        </article>

        <article class="surface-card kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Total de Cursos</span>
            <div class="kpi-icon navy">
              <mat-icon fontSet="material-icons-round">school</mat-icon>
            </div>
          </div>
          <div class="kpi-value">{{ data.totalCursos }}</div>
          <div class="kpi-foot">{{ data.cursosAtivos }} cursos ativos no catálogo</div>
        </article>

        <article class="surface-card kpi-card">
          <div class="kpi-top">
            <span class="kpi-label">Total de Disciplinas</span>
            <div class="kpi-icon amber">
              <mat-icon fontSet="material-icons-round">menu_book</mat-icon>
            </div>
          </div>
          <div class="kpi-value">{{ data.totalDisciplinas }}</div>
          <div class="kpi-foot">
            {{ data.disciplinasAtivas }} ativas · média {{ data.mediaDisciplinasPorCurso | number:'1.1-1' }} por curso
          </div>
        </article>
      </section>

      <section class="perf-strip">
        <div class="surface-card perf-item">
          <div>
            <span class="perf-title">Taxa de Ativação de Usuários</span>
            <p class="perf-sub">Proporção de contas habilitadas para operação</p>
          </div>
          <strong class="perf-metric">{{ data.taxaUsuariosAtivosPercent | number:'1.1-1' }}%</strong>
        </div>
        <div class="surface-card perf-item">
          <div>
            <span class="perf-title">Média de Disciplinas por Curso</span>
            <p class="perf-sub">Densidade curricular dos cursos cadastrados</p>
          </div>
          <strong class="perf-metric">{{ data.mediaDisciplinasPorCurso | number:'1.1-1' }}</strong>
        </div>
      </section>

      <section class="charts-grid">
        <article class="surface-card chart-card">
          <div class="card-head">
            <h3>Crescimento de Usuários</h3>
            <span>Últimos 6 meses</span>
          </div>
          <div class="chart-wrap">
            <canvas
              baseChart
              [type]="'line'"
              [data]="userGrowthChart()"
              [options]="lineOptions"
            ></canvas>
          </div>
        </article>

        <article class="surface-card chart-card">
          <div class="card-head">
            <h3>Distribuição de Cursos</h3>
            <span>Disciplinas por curso</span>
          </div>
          @if (data.distribuicaoCursos.length === 0) {
            <app-empty-state
              icon="school"
              title="Sem cursos cadastrados"
              description="Cadastre cursos e vincule disciplinas para visualizar a distribuição."
            ></app-empty-state>
          } @else {
            <div class="chart-wrap">
              <canvas
                baseChart
                [type]="'doughnut'"
                [data]="courseDistributionChart()"
                [options]="doughnutOptions"
              ></canvas>
            </div>
          }
        </article>

        <article class="surface-card chart-card chart-wide">
          <div class="card-head">
            <h3>Atividades Administrativas</h3>
            <span>Eventos auditados nos últimos 7 dias</span>
          </div>
          <div class="chart-wrap">
            <canvas
              baseChart
              [type]="'bar'"
              [data]="activityChart()"
              [options]="barOptions"
            ></canvas>
          </div>
        </article>
      </section>

      <section class="lists-grid">
        <article class="surface-card list-card">
          <div class="card-head">
            <h3>Últimos Usuários</h3>
            @if (authService.hasRole(['ADMIN', 'GESTOR'])) {
              <a routerLink="/usuarios" class="view-all">Ver todos</a>
            }
          </div>
          @if (data.ultimosUsuarios.length === 0) {
            <app-empty-state icon="group" title="Nenhum usuário" description="Sem usuários recentes."></app-empty-state>
          } @else {
            <div class="item-list">
              @for (u of data.ultimosUsuarios; track u.id) {
                <div class="list-row">
                  <div>
                    <div class="row-title">{{ u.nome }}</div>
                    <div class="row-sub">{{ u.email }} · {{ u.perfil | roleLabel }}</div>
                  </div>
                  <app-status-badge
                    [label]="u.ativo ? 'Ativo' : 'Inativo'"
                    [variant]="u.ativo ? 'success' : 'danger'"
                  ></app-status-badge>
                </div>
              }
            </div>
          }
        </article>

        <article class="surface-card list-card">
          <div class="card-head">
            <h3>Cursos Recentes</h3>
            <a routerLink="/cursos" class="view-all">Ver catálogo</a>
          </div>
          @if (data.cursosRecentes.length === 0) {
            <app-empty-state icon="school" title="Nenhum curso" description="Ainda não há cursos cadastrados."></app-empty-state>
          } @else {
            <div class="item-list">
              @for (c of data.cursosRecentes; track c.id) {
                <div class="list-row">
                  <div>
                    <div class="row-title">{{ c.nome }}</div>
                    <div class="row-sub">{{ c.codigo }} · {{ c.disciplinas.length }} disciplina(s)</div>
                  </div>
                  <app-status-badge
                    [label]="c.ativo ? 'Ativo' : 'Inativo'"
                    [variant]="c.ativo ? 'success' : 'neutral'"
                  ></app-status-badge>
                </div>
              }
            </div>
          }
        </article>

        <article class="surface-card list-card">
          <div class="card-head">
            <h3>Atividades Recentes</h3>
            @if (authService.hasRole(['ADMIN'])) {
              <a routerLink="/auditoria" class="view-all">Auditoria</a>
            }
          </div>
          @if (atividades().length === 0) {
            <app-empty-state icon="history" title="Sem eventos" description="Nenhuma atividade recente registrada."></app-empty-state>
          } @else {
            <div class="item-list">
              @for (a of atividades(); track a.id) {
                <div class="list-row">
                  <div>
                    <div class="row-title">{{ a.acao }} · {{ a.entidade }}</div>
                    <div class="row-sub">{{ a.detalhes || a.usuarioEmail || 'Sistema' }}</div>
                  </div>
                  <span class="time-chip">{{ a.criadoEm | date:'dd/MM HH:mm' }}</span>
                </div>
              }
            </div>
          }
        </article>
      </section>
    }
  `,
  styles: [`
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
    .kpi-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .kpi-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-secondary);
    }
    .kpi-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .kpi-icon.blue { background: var(--color-primary-soft); color: var(--color-primary); }
    .kpi-icon.green { background: var(--color-success-soft); color: var(--color-success); }
    .kpi-icon.navy { background: #E0E7FF; color: var(--color-primary-dark); }
    .kpi-icon.amber { background: var(--color-warning-soft); color: #B45309; }
    .kpi-value {
      font-size: 30px;
      font-weight: 700;
      color: var(--color-text-primary);
      letter-spacing: -0.02em;
    }
    .kpi-foot { font-size: 12px; color: var(--color-text-secondary); }

    .perf-strip {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
    .perf-item {
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .perf-title { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
    .perf-sub { margin: 3px 0 0; font-size: 12px; color: var(--color-text-secondary); }
    .perf-metric { font-size: 22px; font-weight: 700; color: var(--color-primary); }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }
    .chart-card { padding: 20px; }
    .chart-wide { grid-column: 1 / -1; }
    .chart-wrap { position: relative; height: 260px; }
    .card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }
    .card-head h3 { margin: 0; font-size: 16px; font-weight: 600; color: var(--color-text-primary); }
    .card-head span { font-size: 12px; color: var(--color-text-secondary); }
    .view-all { font-size: 13px; font-weight: 500; color: var(--color-primary); text-decoration: none; }
    .view-all:hover { text-decoration: underline; }

    .lists-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
    }
    .list-card { padding: 20px; }
    .item-list { display: flex; flex-direction: column; gap: 12px; }
    .list-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
    }
    .list-row:last-child { padding-bottom: 0; border-bottom: none; }
    .row-title { font-size: 14px; font-weight: 600; color: var(--color-text-primary); }
    .row-sub { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; }
    .time-chip { font-size: 11px; color: var(--color-text-secondary); white-space: nowrap; }

    @media (max-width: 1180px) {
      .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .lists-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .kpi-grid, .perf-strip, .charts-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly resumo = signal<DashboardResumoDto | null>(null);
  readonly atividades = signal<AuditoriaDto[]>([]);

  readonly lineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  readonly barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  readonly doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  readonly userGrowthChart = computed<ChartConfiguration<'line'>['data']>(() => {
    const items = this.resumo()?.crescimentoUsuarios ?? [];
    return {
      labels: items.map((i) => i.periodo),
      datasets: [
        {
          label: 'Novos usuários',
          data: items.map((i) => i.quantidade),
          borderColor: '#2563EB',
          backgroundColor: 'rgba(37, 99, 235, 0.12)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#2563EB',
        },
      ],
    };
  });

  readonly courseDistributionChart = computed<ChartConfiguration<'doughnut'>['data']>(() => {
    const items = this.resumo()?.distribuicaoCursos ?? [];
    return {
      labels: items.map((c) => `${c.codigo} (${c.totalDisciplinas})`),
      datasets: [
        {
          data: items.map((c) => c.totalDisciplinas),
          backgroundColor: ['#2563EB', '#172554', '#16A34A', '#F59E0B', '#0EA5E9', '#64748B', '#3B82F6', '#1E40AF'],
          borderWidth: 1,
        },
      ],
    };
  });

  readonly activityChart = computed<ChartConfiguration<'bar'>['data']>(() => {
    const items = this.resumo()?.atividadesPorDia ?? [];
    return {
      labels: items.map((a) => a.data),
      datasets: [
        {
          label: 'Eventos registrados',
          data: items.map((a) => a.quantidade),
          backgroundColor: '#172554',
          borderRadius: 6,
          maxBarThickness: 38,
        },
      ],
    };
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    forkJoin({
      resumo: this.http.get<DashboardResumoDto>('/api/v1/dashboard/resumo'),
      atividades: this.http.get<AuditoriaDto[]>('/api/v1/dashboard/atividades'),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ resumo, atividades }) => {
          this.resumo.set(resumo);
          this.atividades.set(atividades.slice(0, 6));
        },
        error: () => {
          this.toast.error('Erro ao carregar dados do dashboard.');
        },
      });
  }
}

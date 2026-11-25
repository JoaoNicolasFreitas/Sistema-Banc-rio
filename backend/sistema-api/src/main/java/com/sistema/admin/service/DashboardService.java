package com.sistema.admin.service;

import com.sistema.admin.dto.AuditoriaDto;
import com.sistema.admin.dto.DashboardResumoDto;
import com.sistema.admin.dto.DashboardResumoDto.AtividadeDiaDto;
import com.sistema.admin.dto.DashboardResumoDto.DistribuicaoCursoDto;
import com.sistema.admin.dto.DashboardResumoDto.SerieMensalDto;
import com.sistema.admin.entity.Auditoria;
import com.sistema.admin.entity.Curso;
import com.sistema.admin.entity.Usuario;
import com.sistema.admin.mapper.AuditoriaMapper;
import com.sistema.admin.mapper.CursoMapper;
import com.sistema.admin.mapper.UsuarioMapper;
import com.sistema.admin.repository.AuditoriaRepository;
import com.sistema.admin.repository.CursoRepository;
import com.sistema.admin.repository.DisciplinaRepository;
import com.sistema.admin.repository.UsuarioRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DashboardService {

    private static final Locale PT_BR = Locale.forLanguageTag("pt-BR");
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("MMM/yy", PT_BR);
    private static final DateTimeFormatter DAY_FMT = DateTimeFormatter.ofPattern("dd/MM", PT_BR);

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final AuditoriaRepository auditoriaRepository;
    private final UsuarioMapper usuarioMapper;
    private final CursoMapper cursoMapper;
    private final AuditoriaMapper auditoriaMapper;

    public DashboardService(
            UsuarioRepository usuarioRepository,
            CursoRepository cursoRepository,
            DisciplinaRepository disciplinaRepository,
            AuditoriaRepository auditoriaRepository,
            UsuarioMapper usuarioMapper,
            CursoMapper cursoMapper,
            AuditoriaMapper auditoriaMapper) {
        this.usuarioRepository = usuarioRepository;
        this.cursoRepository = cursoRepository;
        this.disciplinaRepository = disciplinaRepository;
        this.auditoriaRepository = auditoriaRepository;
        this.usuarioMapper = usuarioMapper;
        this.cursoMapper = cursoMapper;
        this.auditoriaMapper = auditoriaMapper;
    }

    @Transactional(readOnly = true)
    public DashboardResumoDto obterResumo() {
        long totalUsuarios = usuarioRepository.count();
        long usuariosAtivos = usuarioRepository.countByAtivoTrue();
        long totalCursos = cursoRepository.count();
        long cursosAtivos = cursoRepository.countByAtivoTrue();
        long totalDisciplinas = disciplinaRepository.count();
        long disciplinasAtivas = disciplinaRepository.countByAtivoTrue();

        double taxaAtivos = totalUsuarios == 0
                ? 0.0
                : Math.round(((double) usuariosAtivos / totalUsuarios) * 1000.0) / 10.0;

        List<Curso> todosCursos = cursoRepository.findAllByOrderByNomeAsc();
        long totalVinculos = todosCursos.stream().mapToLong(c -> c.getDisciplinas().size()).sum();
        double mediaDisciplinas = totalCursos == 0
                ? 0.0
                : Math.round(((double) totalVinculos / totalCursos) * 10.0) / 10.0;

        List<SerieMensalDto> crescimentoUsuarios = buildCrescimentoUsuarios();
        List<DistribuicaoCursoDto> distribuicaoCursos = todosCursos.stream()
                .limit(8)
                .map(c -> new DistribuicaoCursoDto(
                        c.getNome(),
                        c.getCodigo(),
                        c.getDisciplinas().size(),
                        c.isAtivo()))
                .toList();
        List<AtividadeDiaDto> atividadesPorDia = buildAtividadesUltimos7Dias();

        var ultimosUsuarios = usuarioRepository.findTop5ByOrderByCriadoEmDesc().stream()
                .map(usuarioMapper::toDto)
                .toList();
        var cursosRecentes = cursoRepository.findTop5ByOrderByCriadoEmDesc().stream()
                .map(cursoMapper::toDto)
                .toList();

        return new DashboardResumoDto(
                totalUsuarios,
                usuariosAtivos,
                totalCursos,
                cursosAtivos,
                totalDisciplinas,
                disciplinasAtivas,
                taxaAtivos,
                mediaDisciplinas,
                crescimentoUsuarios,
                distribuicaoCursos,
                atividadesPorDia,
                ultimosUsuarios,
                cursosRecentes
        );
    }

    @Transactional(readOnly = true)
    public List<AuditoriaDto> listarAtividadesRecentes(boolean includeIp) {
        return auditoriaRepository.findTop10ByOrderByCriadoEmDesc().stream()
                .map(a -> auditoriaMapper.toDto(a, includeIp))
                .toList();
    }

    private List<SerieMensalDto> buildCrescimentoUsuarios() {
        YearMonth currentMonth = YearMonth.now(ZoneOffset.UTC);
        YearMonth startMonth = currentMonth.minusMonths(5);
        Instant since = startMonth.atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        Map<YearMonth, Long> counts = new LinkedHashMap<>();
        for (int i = 0; i < 6; i++) {
            counts.put(startMonth.plusMonths(i), 0L);
        }

        for (Usuario u : usuarioRepository.findAllCreatedSince(since)) {
            YearMonth ym = YearMonth.from(u.getCriadoEm().atOffset(ZoneOffset.UTC));
            if (counts.containsKey(ym)) {
                counts.put(ym, counts.get(ym) + 1);
            }
        }

        List<SerieMensalDto> series = new ArrayList<>();
        counts.forEach((ym, count) -> series.add(new SerieMensalDto(ym.format(MONTH_FMT), count)));
        return series;
    }

    private List<AtividadeDiaDto> buildAtividadesUltimos7Dias() {
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate start = today.minusDays(6);
        Instant since = start.atStartOfDay(ZoneOffset.UTC).toInstant();

        Map<LocalDate, Long> counts = new LinkedHashMap<>();
        for (int i = 0; i < 7; i++) {
            counts.put(start.plusDays(i), 0L);
        }

        for (Auditoria a : auditoriaRepository.findAllSince(since.minus(1, ChronoUnit.SECONDS))) {
            LocalDate date = a.getCriadoEm().atOffset(ZoneOffset.UTC).toLocalDate();
            if (counts.containsKey(date)) {
                counts.put(date, counts.get(date) + 1);
            }
        }

        List<AtividadeDiaDto> series = new ArrayList<>();
        counts.forEach((date, count) -> series.add(new AtividadeDiaDto(date.format(DAY_FMT), count)));
        return series;
    }
}

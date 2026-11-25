package com.sistema.admin.dto;

import java.util.List;

public record DashboardResumoDto(
        long totalUsuarios,
        long usuariosAtivos,
        long totalCursos,
        long cursosAtivos,
        long totalDisciplinas,
        long disciplinasAtivas,
        double taxaUsuariosAtivosPercent,
        double mediaDisciplinasPorCurso,
        List<SerieMensalDto> crescimentoUsuarios,
        List<DistribuicaoCursoDto> distribuicaoCursos,
        List<AtividadeDiaDto> atividadesPorDia,
        List<UsuarioDto> ultimosUsuarios,
        List<CursoDto> cursosRecentes
) {
    public record SerieMensalDto(String periodo, long quantidade) {}

    public record DistribuicaoCursoDto(String cursoNome, String codigo, int totalDisciplinas, boolean ativo) {}

    public record AtividadeDiaDto(String data, long quantidade) {}
}

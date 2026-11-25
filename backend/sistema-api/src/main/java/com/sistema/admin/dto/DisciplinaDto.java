package com.sistema.admin.dto;

import java.time.Instant;
import java.util.List;

public record DisciplinaDto(
        Long id,
        String nome,
        String codigo,
        String descricao,
        int cargaHoraria,
        boolean ativo,
        Instant criadoEm,
        Instant atualizadoEm,
        List<CursoResumoDto> cursos
) {}

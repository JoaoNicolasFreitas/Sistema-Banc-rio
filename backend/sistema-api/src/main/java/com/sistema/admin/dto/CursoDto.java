package com.sistema.admin.dto;

import java.time.Instant;
import java.util.List;

public record CursoDto(
        Long id,
        String nome,
        String codigo,
        String descricao,
        boolean ativo,
        Instant criadoEm,
        Instant atualizadoEm,
        List<DisciplinaResumoDto> disciplinas
) {}

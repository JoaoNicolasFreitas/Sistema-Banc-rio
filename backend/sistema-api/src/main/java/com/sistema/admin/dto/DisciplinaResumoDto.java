package com.sistema.admin.dto;

public record DisciplinaResumoDto(
        Long id,
        String nome,
        String codigo,
        Integer cargaHoraria,
        boolean ativo
) {}

package com.sistema.admin.dto;

import java.time.Instant;

public record ConfiguracaoDto(
        Long id,
        String chave,
        String valor,
        String descricao,
        String categoria,
        Instant atualizadoEm
) {}

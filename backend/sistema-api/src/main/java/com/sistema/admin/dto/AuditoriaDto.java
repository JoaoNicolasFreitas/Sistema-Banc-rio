package com.sistema.admin.dto;

import java.time.Instant;

public record AuditoriaDto(
        Long id,
        Long usuarioId,
        String usuarioEmail,
        String acao,
        String entidade,
        String entidadeId,
        String detalhes,
        String ipOrigem,
        Instant criadoEm
) {}

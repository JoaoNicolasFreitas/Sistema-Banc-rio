package com.sistema.admin.dto;

import java.time.Instant;

public record UsuarioDto(
        Long id,
        String nome,
        String email,
        String perfil,
        String perfilDescricao,
        boolean ativo,
        Instant ultimoAcessoEm,
        Instant criadoEm,
        Instant atualizadoEm
) {}

package com.sistema.admin.dto;

import java.time.Instant;

public record AuthUserDto(
        Long id,
        String nome,
        String email,
        String perfil,
        boolean ativo,
        Instant ultimoAcessoEm,
        Instant criadoEm
) {}

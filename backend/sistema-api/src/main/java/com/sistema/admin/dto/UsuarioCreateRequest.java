package com.sistema.admin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UsuarioCreateRequest(
        @NotBlank @Size(min = 3, max = 150) String nome,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(min = 8, max = 128) String senha,
        @NotBlank @Pattern(regexp = "ADMIN|GESTOR|OPERADOR") String perfil,
        @NotNull Boolean ativo
) {}

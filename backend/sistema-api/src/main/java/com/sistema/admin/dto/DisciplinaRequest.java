package com.sistema.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record DisciplinaRequest(
        @NotBlank @Size(max = 150) String nome,
        @NotBlank @Size(max = 40) String codigo,
        @Size(max = 1000) String descricao,
        @NotNull @Min(1) @Max(1000) Integer cargaHoraria,
        @NotNull Boolean ativo,
        List<Long> cursoIds
) {}

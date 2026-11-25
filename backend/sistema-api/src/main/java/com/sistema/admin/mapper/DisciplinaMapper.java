package com.sistema.admin.mapper;

import com.sistema.admin.dto.CursoResumoDto;
import com.sistema.admin.dto.DisciplinaDto;
import com.sistema.admin.entity.Curso;
import com.sistema.admin.entity.Disciplina;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class DisciplinaMapper {
    public DisciplinaDto toDto(Disciplina disciplina) {
        List<CursoResumoDto> cursos = disciplina.getCursos().stream()
                .sorted(Comparator.comparing(Curso::getNome, String.CASE_INSENSITIVE_ORDER))
                .map(c -> new CursoResumoDto(c.getId(), c.getNome(), c.getCodigo(), c.isAtivo()))
                .toList();
        return new DisciplinaDto(
                disciplina.getId(), disciplina.getNome(), disciplina.getCodigo(),
                disciplina.getDescricao(), disciplina.getCargaHoraria(), disciplina.isAtivo(),
                disciplina.getCriadoEm(), disciplina.getAtualizadoEm(), cursos);
    }
}

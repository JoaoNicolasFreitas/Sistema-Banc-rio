package com.sistema.admin.mapper;

import com.sistema.admin.dto.CursoDto;
import com.sistema.admin.dto.CursoResumoDto;
import com.sistema.admin.dto.DisciplinaResumoDto;
import com.sistema.admin.entity.Curso;
import com.sistema.admin.entity.Disciplina;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class CursoMapper {

    public CursoDto toDto(Curso curso) {
        List<DisciplinaResumoDto> disciplinas = curso.getDisciplinas().stream()
                .sorted(Comparator.comparing(Disciplina::getNome, String.CASE_INSENSITIVE_ORDER))
                .map(this::toDisciplinaResumo)
                .toList();

        return new CursoDto(
                curso.getId(),
                curso.getNome(),
                curso.getCodigo(),
                curso.getDescricao(),
                curso.isAtivo(),
                curso.getCriadoEm(),
                curso.getAtualizadoEm(),
                disciplinas
        );
    }

    public CursoResumoDto toResumo(Curso curso) {
        return new CursoResumoDto(curso.getId(), curso.getNome(), curso.getCodigo(), curso.isAtivo());
    }

    public DisciplinaResumoDto toDisciplinaResumo(Disciplina disciplina) {
        return new DisciplinaResumoDto(
                disciplina.getId(),
                disciplina.getNome(),
                disciplina.getCodigo(),
                disciplina.getCargaHoraria(),
                disciplina.isAtivo()
        );
    }
}

package com.sistema.admin.service;

import com.sistema.admin.dto.DisciplinaDto;
import com.sistema.admin.dto.DisciplinaRequest;
import com.sistema.admin.entity.Curso;
import com.sistema.admin.entity.Disciplina;
import com.sistema.admin.entity.Usuario;
import com.sistema.admin.exception.ConflictException;
import com.sistema.admin.exception.ResourceNotFoundException;
import com.sistema.admin.mapper.DisciplinaMapper;
import com.sistema.admin.repository.CursoRepository;
import com.sistema.admin.repository.DisciplinaRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DisciplinaService {
    private final DisciplinaRepository disciplinaRepository;
    private final CursoRepository cursoRepository;
    private final DisciplinaMapper disciplinaMapper;
    private final AuditoriaService auditoriaService;

    public DisciplinaService(DisciplinaRepository disciplinaRepository, CursoRepository cursoRepository,
                             DisciplinaMapper disciplinaMapper, AuditoriaService auditoriaService) {
        this.disciplinaRepository = disciplinaRepository;
        this.cursoRepository = cursoRepository;
        this.disciplinaMapper = disciplinaMapper;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public Page<DisciplinaDto> listar(String busca, Boolean ativo, Pageable pageable) {
        Specification<Disciplina> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (busca != null && !busca.isBlank()) {
                String like = "%" + busca.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("nome")), like),
                        cb.like(cb.lower(root.get("codigo")), like)));
            }
            if (ativo != null) predicates.add(cb.equal(root.get("ativo"), ativo));
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return disciplinaRepository.findAll(spec, pageable).map(disciplinaMapper::toDto);
    }

    @Transactional(readOnly = true)
    public DisciplinaDto buscar(Long id) {
        return disciplinaMapper.toDto(disciplinaRepository.findWithCursosById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disciplina não encontrada.")));
    }

    @Transactional
    public DisciplinaDto criar(DisciplinaRequest request, Usuario responsavel, String ip) {
        String codigo = request.codigo().trim().toUpperCase();
        if (disciplinaRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException("Já existe uma disciplina com este código.");
        }
        Disciplina disciplina = new Disciplina();
        aplicarDados(disciplina, request);
        disciplina = disciplinaRepository.save(disciplina);
        registrar(responsavel, ip, "CRIACAO", disciplina.getId(), "Disciplina criada.");
        return disciplinaMapper.toDto(disciplina);
    }

    @Transactional
    public DisciplinaDto atualizar(Long id, DisciplinaRequest request, Usuario responsavel, String ip) {
        Disciplina disciplina = disciplinaRepository.findWithCursosById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disciplina não encontrada."));
        String codigo = request.codigo().trim().toUpperCase();
        if (disciplinaRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id)) {
            throw new ConflictException("Já existe outra disciplina com este código.");
        }
        aplicarDados(disciplina, request);
        disciplina = disciplinaRepository.save(disciplina);
        registrar(responsavel, ip, "ATUALIZACAO", disciplina.getId(), "Disciplina atualizada.");
        return disciplinaMapper.toDto(disciplina);
    }

    @Transactional
    public void excluir(Long id, Usuario responsavel, String ip) {
        Disciplina disciplina = disciplinaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disciplina não encontrada."));
        disciplinaRepository.delete(disciplina);
        registrar(responsavel, ip, "EXCLUSAO", id, "Disciplina excluída.");
    }

    private void aplicarDados(Disciplina disciplina, DisciplinaRequest request) {
        disciplina.setNome(request.nome().trim());
        disciplina.setCodigo(request.codigo().trim().toUpperCase());
        disciplina.setDescricao(request.descricao() == null || request.descricao().isBlank()
                ? null : request.descricao().trim());
        disciplina.setCargaHoraria(request.cargaHoraria());
        disciplina.setAtivo(Boolean.TRUE.equals(request.ativo()));
        LinkedHashSet<Curso> cursos = new LinkedHashSet<>();
        if (request.cursoIds() != null) {
            for (Long cursoId : request.cursoIds()) {
                cursos.add(cursoRepository.findById(cursoId)
                        .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado: " + cursoId)));
            }
        }
        for (Curso curso : new LinkedHashSet<>(disciplina.getCursos())) {
            curso.getDisciplinas().remove(disciplina);
        }
        disciplina.setCursos(cursos);
        for (Curso curso : cursos) {
            curso.getDisciplinas().add(disciplina);
        }
    }

    private void registrar(Usuario responsavel, String ip, String acao, Long id, String detalhes) {
        auditoriaService.registrar(responsavel, responsavel != null ? responsavel.getEmail() : null,
                acao, "DISCIPLINA", String.valueOf(id), detalhes, ip);
    }
}

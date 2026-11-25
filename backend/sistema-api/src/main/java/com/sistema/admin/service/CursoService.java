package com.sistema.admin.service;

import com.sistema.admin.dto.CursoDto;
import com.sistema.admin.dto.CursoRequest;
import com.sistema.admin.entity.Curso;
import com.sistema.admin.entity.Disciplina;
import com.sistema.admin.entity.Usuario;
import com.sistema.admin.exception.ConflictException;
import com.sistema.admin.exception.ResourceNotFoundException;
import com.sistema.admin.mapper.CursoMapper;
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
public class CursoService {
    private final CursoRepository cursoRepository;
    private final DisciplinaRepository disciplinaRepository;
    private final CursoMapper cursoMapper;
    private final AuditoriaService auditoriaService;

    public CursoService(CursoRepository cursoRepository, DisciplinaRepository disciplinaRepository,
                        CursoMapper cursoMapper, AuditoriaService auditoriaService) {
        this.cursoRepository = cursoRepository;
        this.disciplinaRepository = disciplinaRepository;
        this.cursoMapper = cursoMapper;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public Page<CursoDto> listar(String busca, Boolean ativo, Pageable pageable) {
        Specification<Curso> spec = (root, query, cb) -> {
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
        return cursoRepository.findAll(spec, pageable).map(cursoMapper::toDto);
    }

    @Transactional(readOnly = true)
    public CursoDto buscar(Long id) {
        return cursoMapper.toDto(cursoRepository.findWithDisciplinasById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado.")));
    }

    @Transactional
    public CursoDto criar(CursoRequest request, Usuario responsavel, String ip) {
        String codigo = request.codigo().trim().toUpperCase();
        if (cursoRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ConflictException("Já existe um curso com este código.");
        }
        Curso curso = new Curso();
        curso.setNome(request.nome().trim());
        curso.setCodigo(codigo);
        curso.setDescricao(normalizarDescricao(request.descricao()));
        curso.setAtivo(Boolean.TRUE.equals(request.ativo()));
        aplicarDisciplinas(curso, request.disciplinaIds());
        curso = cursoRepository.save(curso);
        registrar(responsavel, ip, "CRIACAO", curso.getId(), "Curso criado.");
        return cursoMapper.toDto(curso);
    }

    @Transactional
    public CursoDto atualizar(Long id, CursoRequest request, Usuario responsavel, String ip) {
        Curso curso = cursoRepository.findWithDisciplinasById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado."));
        String codigo = request.codigo().trim().toUpperCase();
        if (cursoRepository.existsByCodigoIgnoreCaseAndIdNot(codigo, id)) {
            throw new ConflictException("Já existe outro curso com este código.");
        }
        curso.setNome(request.nome().trim());
        curso.setCodigo(codigo);
        curso.setDescricao(normalizarDescricao(request.descricao()));
        curso.setAtivo(Boolean.TRUE.equals(request.ativo()));
        aplicarDisciplinas(curso, request.disciplinaIds());
        curso = cursoRepository.save(curso);
        registrar(responsavel, ip, "ATUALIZACAO", curso.getId(), "Curso atualizado.");
        return cursoMapper.toDto(curso);
    }

    @Transactional
    public void excluir(Long id, Usuario responsavel, String ip) {
        Curso curso = cursoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado."));
        cursoRepository.delete(curso);
        registrar(responsavel, ip, "EXCLUSAO", id, "Curso excluído.");
    }

    private void aplicarDisciplinas(Curso curso, List<Long> ids) {
        LinkedHashSet<Disciplina> disciplinas = new LinkedHashSet<>();
        if (ids != null) {
            for (Long disciplinaId : ids) {
                disciplinas.add(disciplinaRepository.findById(disciplinaId)
                        .orElseThrow(() -> new ResourceNotFoundException("Disciplina não encontrada: " + disciplinaId)));
            }
        }
        curso.setDisciplinas(disciplinas);
    }

    private String normalizarDescricao(String descricao) {
        return descricao == null || descricao.isBlank() ? null : descricao.trim();
    }

    private void registrar(Usuario responsavel, String ip, String acao, Long id, String detalhes) {
        auditoriaService.registrar(responsavel, responsavel != null ? responsavel.getEmail() : null,
                acao, "CURSO", String.valueOf(id), detalhes, ip);
    }
}

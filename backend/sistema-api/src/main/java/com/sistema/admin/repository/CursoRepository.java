package com.sistema.admin.repository;

import com.sistema.admin.entity.Curso;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CursoRepository extends JpaRepository<Curso, Long>, JpaSpecificationExecutor<Curso> {

    @EntityGraph(attributePaths = "disciplinas")
    Optional<Curso> findWithDisciplinasById(Long id);

    boolean existsByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCaseAndIdNot(String codigo, Long id);

    long countByAtivoTrue();

    @EntityGraph(attributePaths = "disciplinas")
    List<Curso> findTop5ByOrderByCriadoEmDesc();

    @EntityGraph(attributePaths = "disciplinas")
    List<Curso> findAllByOrderByNomeAsc();
}

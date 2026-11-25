package com.sistema.admin.repository;

import com.sistema.admin.entity.Usuario;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UsuarioRepository extends JpaRepository<Usuario, Long>, JpaSpecificationExecutor<Usuario> {

    Optional<Usuario> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

    boolean existsByPerfilNome(String nome);

    long countByAtivoTrue();

    long countByPerfilNomeAndAtivoTrue(String nome);

    List<Usuario> findTop5ByOrderByCriadoEmDesc();

    @Query("SELECT u FROM Usuario u WHERE u.criadoEm >= :since ORDER BY u.criadoEm ASC")
    List<Usuario> findAllCreatedSince(@Param("since") Instant since);
}

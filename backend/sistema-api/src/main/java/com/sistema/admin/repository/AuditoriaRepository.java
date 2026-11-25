package com.sistema.admin.repository;

import com.sistema.admin.entity.Auditoria;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditoriaRepository extends JpaRepository<Auditoria, Long>, JpaSpecificationExecutor<Auditoria> {

    List<Auditoria> findTop10ByOrderByCriadoEmDesc();

    @Query("SELECT a FROM Auditoria a WHERE a.criadoEm >= :since ORDER BY a.criadoEm ASC")
    List<Auditoria> findAllSince(@Param("since") Instant since);
}

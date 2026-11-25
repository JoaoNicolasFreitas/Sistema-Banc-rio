package com.sistema.admin.repository;

import com.sistema.admin.entity.ConfiguracaoSistema;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracaoSistemaRepository extends JpaRepository<ConfiguracaoSistema, Long> {

    Optional<ConfiguracaoSistema> findByChave(String chave);

    List<ConfiguracaoSistema> findAllByOrderByCategoriaAscChaveAsc();
}

package com.sistema.admin.service;

import com.sistema.admin.dto.ConfiguracaoDto;
import com.sistema.admin.entity.ConfiguracaoSistema;
import com.sistema.admin.repository.ConfiguracaoSistemaRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConfiguracaoService {
    private final ConfiguracaoSistemaRepository repository;

    public ConfiguracaoService(ConfiguracaoSistemaRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ConfiguracaoDto> listar() {
        return repository.findAllByOrderByCategoriaAscChaveAsc().stream()
                .map(c -> new ConfiguracaoDto(c.getId(), c.getChave(), c.getValor(),
                        c.getDescricao(), c.getCategoria(), c.getAtualizadoEm()))
                .toList();
    }
}

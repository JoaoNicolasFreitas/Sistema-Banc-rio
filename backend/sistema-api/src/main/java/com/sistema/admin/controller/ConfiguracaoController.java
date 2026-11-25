package com.sistema.admin.controller;

import com.sistema.admin.dto.ConfiguracaoDto;
import com.sistema.admin.service.ConfiguracaoService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/configuracoes")
public class ConfiguracaoController {
    private final ConfiguracaoService service;

    public ConfiguracaoController(ConfiguracaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<ConfiguracaoDto> listar() {
        return service.listar();
    }
}

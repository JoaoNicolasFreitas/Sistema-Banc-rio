package com.sistema.admin.controller;

import com.sistema.admin.dto.AuditoriaDto;
import com.sistema.admin.dto.PageResponse;
import com.sistema.admin.service.AuditoriaService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auditoria")
public class AuditoriaController {
    private final AuditoriaService service;

    public AuditoriaController(AuditoriaService service) {
        this.service = service;
    }

    @GetMapping
    public PageResponse<AuditoriaDto> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return PageResponse.from(service.listar(PageRequest.of(page, size, Sort.by("criadoEm").descending())));
    }
}

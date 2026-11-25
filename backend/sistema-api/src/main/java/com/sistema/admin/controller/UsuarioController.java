package com.sistema.admin.controller;

import com.sistema.admin.dto.PageResponse;
import com.sistema.admin.dto.UsuarioCreateRequest;
import com.sistema.admin.dto.UsuarioDto;
import com.sistema.admin.dto.UsuarioUpdateRequest;
import com.sistema.admin.entity.Usuario;
import com.sistema.admin.exception.ResourceNotFoundException;
import com.sistema.admin.repository.UsuarioRepository;
import com.sistema.admin.security.AuthenticatedUser;
import com.sistema.admin.service.AuditoriaService;
import com.sistema.admin.service.UsuarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {
    private final UsuarioService service;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public UsuarioController(UsuarioService service, UsuarioRepository usuarioRepository,
                             AuditoriaService auditoriaService) {
        this.service = service;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    public PageResponse<UsuarioDto> listar(
            @RequestParam(required = false) String busca,
            @RequestParam(required = false) String perfil,
            @RequestParam(required = false) Boolean ativo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "nome") String sort,
            @RequestParam(defaultValue = "asc") String direction) {
        Sort sortOption = direction.equalsIgnoreCase("desc") ? Sort.by(sort).descending() : Sort.by(sort).ascending();
        return PageResponse.from(service.listar(busca, perfil, ativo, PageRequest.of(page, size, sortOption)));
    }

    @PostMapping
    public ResponseEntity<UsuarioDto> criar(@Valid @RequestBody UsuarioCreateRequest request,
                                            @AuthenticationPrincipal AuthenticatedUser principal,
                                            HttpServletRequest httpRequest) {
        Usuario responsavel = principal == null ? null : usuarioRepository.findById(principal.getId()).orElse(null);
        UsuarioDto dto = service.criar(request, responsavel, auditoriaService.extrairIp(httpRequest));
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/{id}")
    public UsuarioDto buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PutMapping("/{id}")
    public UsuarioDto atualizar(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateRequest request,
                                @AuthenticationPrincipal AuthenticatedUser principal,
                                HttpServletRequest httpRequest) {
        Usuario responsavel = principal == null ? null : usuarioRepository.findById(principal.getId()).orElse(null);
        return service.atualizar(id, request, responsavel, auditoriaService.extrairIp(httpRequest));
    }

    @PatchMapping("/{id}/status")
    public UsuarioDto status(@PathVariable Long id, @RequestBody Map<String, Boolean> body,
                             @AuthenticationPrincipal AuthenticatedUser principal,
                             HttpServletRequest httpRequest) {
        Boolean ativo = body.get("ativo");
        if (ativo == null) throw new IllegalArgumentException("O campo ativo é obrigatório.");
        Usuario responsavel = principal == null ? null : usuarioRepository.findById(principal.getId()).orElse(null);
        return service.alterarStatus(id, ativo, responsavel, auditoriaService.extrairIp(httpRequest));
    }
}

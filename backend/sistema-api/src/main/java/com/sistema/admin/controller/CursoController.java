package com.sistema.admin.controller;

import com.sistema.admin.dto.CursoDto;
import com.sistema.admin.dto.CursoRequest;
import com.sistema.admin.dto.PageResponse;
import com.sistema.admin.entity.Usuario;
import com.sistema.admin.repository.UsuarioRepository;
import com.sistema.admin.security.AuthenticatedUser;
import com.sistema.admin.service.AuditoriaService;
import com.sistema.admin.service.CursoService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cursos")
public class CursoController {
    private final CursoService service;
    private final UsuarioRepository usuarioRepository;
    private final AuditoriaService auditoriaService;

    public CursoController(CursoService service, UsuarioRepository usuarioRepository,
                           AuditoriaService auditoriaService) {
        this.service = service;
        this.usuarioRepository = usuarioRepository;
        this.auditoriaService = auditoriaService;
    }

    @GetMapping
    public PageResponse<CursoDto> listar(@RequestParam(required = false) String busca,
                                         @RequestParam(required = false) Boolean ativo,
                                         @RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "10") int size,
                                         @RequestParam(defaultValue = "nome") String sort,
                                         @RequestParam(defaultValue = "asc") String direction) {
        Sort sortOption = direction.equalsIgnoreCase("desc") ? Sort.by(sort).descending() : Sort.by(sort).ascending();
        return PageResponse.from(service.listar(busca, ativo, PageRequest.of(page, size, sortOption)));
    }

    @PostMapping
    public ResponseEntity<CursoDto> criar(@Valid @RequestBody CursoRequest request,
                                          @AuthenticationPrincipal AuthenticatedUser principal,
                                          HttpServletRequest httpRequest) {
        Usuario responsavel = principal == null ? null : usuarioRepository.findById(principal.getId()).orElse(null);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.criar(request, responsavel, auditoriaService.extrairIp(httpRequest)));
    }

    @GetMapping("/{id}")
    public CursoDto buscar(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PutMapping("/{id}")
    public CursoDto atualizar(@PathVariable Long id, @Valid @RequestBody CursoRequest request,
                              @AuthenticationPrincipal AuthenticatedUser principal,
                              HttpServletRequest httpRequest) {
        Usuario responsavel = principal == null ? null : usuarioRepository.findById(principal.getId()).orElse(null);
        return service.atualizar(id, request, responsavel, auditoriaService.extrairIp(httpRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Long id,
                                        @AuthenticationPrincipal AuthenticatedUser principal,
                                        HttpServletRequest httpRequest) {
        Usuario responsavel = principal == null ? null : usuarioRepository.findById(principal.getId()).orElse(null);
        service.excluir(id, responsavel, auditoriaService.extrairIp(httpRequest));
        return ResponseEntity.noContent().build();
    }
}

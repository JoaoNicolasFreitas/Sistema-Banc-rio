package com.sistema.admin.controller;

import com.sistema.admin.dto.AlterarSenhaRequest;
import com.sistema.admin.dto.AuthUserDto;
import com.sistema.admin.dto.PerfilDto;
import com.sistema.admin.dto.PerfilUpdateRequest;
import com.sistema.admin.security.AuthenticatedUser;
import com.sistema.admin.service.AuditoriaService;
import com.sistema.admin.service.PerfilService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Perfil", description = "Gerenciamento do próprio perfil e consulta de perfis de acesso")
public class PerfilController {

    private final PerfilService perfilService;
    private final AuditoriaService auditoriaService;

    public PerfilController(PerfilService perfilService, AuditoriaService auditoriaService) {
        this.perfilService = perfilService;
        this.auditoriaService = auditoriaService;
    }

    @GetMapping("/perfis")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    @Operation(summary = "Listar perfis de acesso disponíveis")
    public ResponseEntity<List<PerfilDto>> listarPerfis() {
        return ResponseEntity.ok(perfilService.listarPerfis());
    }

    @PutMapping("/perfil")
    @Operation(summary = "Atualizar nome e e-mail do usuário autenticado")
    public ResponseEntity<AuthUserDto> atualizarPerfil(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @Valid @RequestBody PerfilUpdateRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(perfilService.atualizarPerfilProprio(
                currentUser.getId(), request, auditoriaService.extrairIp(httpRequest)));
    }

    @PatchMapping("/perfil/senha")
    @Operation(summary = "Alterar senha do usuário autenticado")
    public ResponseEntity<Void> alterarSenha(
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            @Valid @RequestBody AlterarSenhaRequest request,
            HttpServletRequest httpRequest) {
        perfilService.alterarSenhaPropria(
                currentUser.getId(), request, auditoriaService.extrairIp(httpRequest));
        return ResponseEntity.noContent().build();
    }
}

package com.sistema.admin.controller;

import com.sistema.admin.dto.AuthResponse;
import com.sistema.admin.dto.AuthUserDto;
import com.sistema.admin.dto.ForgotPasswordRequest;
import com.sistema.admin.dto.LoginRequest;
import com.sistema.admin.dto.RefreshTokenRequest;
import com.sistema.admin.security.AuthenticatedUser;
import com.sistema.admin.service.AuditoriaService;
import com.sistema.admin.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Autenticação", description = "Endpoints de autenticação, refresh token e sessão")
public class AuthController {

    private final AuthService authService;
    private final AuditoriaService auditoriaService;

    public AuthController(AuthService authService, AuditoriaService auditoriaService) {
        this.authService = authService;
        this.auditoriaService = auditoriaService;
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar usuário e emitir tokens JWT")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        return ResponseEntity.ok(authService.login(request, auditoriaService.extrairIp(httpRequest)));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Renovar access token com refresh token")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refresh(request));
    }

    @PostMapping("/logout")
    @Operation(summary = "Revogar refresh token e encerrar sessão")
    public ResponseEntity<Void> logout(
            @RequestBody(required = false) RefreshTokenRequest request,
            @AuthenticationPrincipal AuthenticatedUser currentUser,
            HttpServletRequest httpRequest) {
        authService.logout(request, currentUser, auditoriaService.extrairIp(httpRequest));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @Operation(summary = "Obter dados do usuário autenticado")
    public ResponseEntity<AuthUserDto> me(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return ResponseEntity.ok(authService.me(currentUser.getId()));
    }

    @PostMapping("/recuperar-senha")
    @Operation(summary = "Registrar solicitação de recuperação de senha")
    public ResponseEntity<Map<String, String>> recuperarSenha(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpRequest) {
        authService.solicitarRecuperacaoSenha(request, auditoriaService.extrairIp(httpRequest));
        return ResponseEntity.ok(Map.of(
                "message",
                "Se o e-mail informado estiver cadastrado, o administrador ou serviço de suporte receberá a solicitação de redefinição."
        ));
    }
}

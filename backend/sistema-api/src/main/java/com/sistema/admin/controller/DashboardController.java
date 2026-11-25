package com.sistema.admin.controller;

import com.sistema.admin.dto.AuditoriaDto;
import com.sistema.admin.dto.DashboardResumoDto;
import com.sistema.admin.security.AuthenticatedUser;
import com.sistema.admin.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@Tag(name = "Dashboard", description = "Indicadores, métricas e atividades recentes")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/resumo")
    @Operation(summary = "Obter resumo de KPIs, séries de gráficos e registros recentes")
    public ResponseEntity<DashboardResumoDto> resumo() {
        return ResponseEntity.ok(dashboardService.obterResumo());
    }

    @GetMapping("/atividades")
    @Operation(summary = "Listar atividades administrativas recentes")
    public ResponseEntity<List<AuditoriaDto>> atividades(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        boolean isAdmin = currentUser != null && "ADMIN".equals(currentUser.getPerfil());
        return ResponseEntity.ok(dashboardService.listarAtividadesRecentes(isAdmin));
    }
}

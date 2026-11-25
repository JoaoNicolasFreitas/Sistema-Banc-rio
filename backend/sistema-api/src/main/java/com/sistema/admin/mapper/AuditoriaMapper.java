package com.sistema.admin.mapper;

import com.sistema.admin.dto.AuditoriaDto;
import com.sistema.admin.entity.Auditoria;
import org.springframework.stereotype.Component;

@Component
public class AuditoriaMapper {

    public AuditoriaDto toDto(Auditoria auditoria, boolean includeIp) {
        return new AuditoriaDto(
                auditoria.getId(),
                auditoria.getUsuario() != null ? auditoria.getUsuario().getId() : null,
                auditoria.getUsuarioEmail(),
                auditoria.getAcao(),
                auditoria.getEntidade(),
                auditoria.getEntidadeId(),
                auditoria.getDetalhes(),
                includeIp ? auditoria.getIpOrigem() : null,
                auditoria.getCriadoEm()
        );
    }
}

package com.sistema.admin.service;

import com.sistema.admin.dto.AuditoriaDto;
import com.sistema.admin.entity.Auditoria;
import com.sistema.admin.entity.Usuario;
import com.sistema.admin.mapper.AuditoriaMapper;
import com.sistema.admin.repository.AuditoriaRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditoriaService {

    private final AuditoriaRepository auditoriaRepository;
    private final AuditoriaMapper auditoriaMapper;

    public AuditoriaService(AuditoriaRepository auditoriaRepository, AuditoriaMapper auditoriaMapper) {
        this.auditoriaRepository = auditoriaRepository;
        this.auditoriaMapper = auditoriaMapper;
    }

    public Page<AuditoriaDto> listar(Pageable pageable) {
        return auditoriaRepository.findAll(pageable).map(a -> auditoriaMapper.toDto(a, true));
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrar(
            Usuario usuario,
            String usuarioEmail,
            String acao,
            String entidade,
            String entidadeId,
            String detalhes,
            String ipOrigem) {
        Auditoria registro = new Auditoria();
        registro.setUsuario(usuario);
        registro.setUsuarioEmail(usuarioEmail != null ? usuarioEmail : (usuario != null ? usuario.getEmail() : null));
        registro.setAcao(acao);
        registro.setEntidade(entidade);
        registro.setEntidadeId(entidadeId);
        registro.setDetalhes(detalhes);
        registro.setIpOrigem(ipOrigem);
        auditoriaRepository.save(registro);
    }

    public String extrairIp(HttpServletRequest request) {
        if (request == null) {
            return null;
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}

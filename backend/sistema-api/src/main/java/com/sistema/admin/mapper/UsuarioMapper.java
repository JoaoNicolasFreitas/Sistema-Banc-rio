package com.sistema.admin.mapper;

import com.sistema.admin.dto.UsuarioDto;
import com.sistema.admin.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public UsuarioDto toDto(Usuario usuario) {
        return new UsuarioDto(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().getNome(),
                usuario.getPerfil().getDescricao(),
                usuario.isAtivo(),
                usuario.getUltimoAcessoEm(),
                usuario.getCriadoEm(),
                usuario.getAtualizadoEm()
        );
    }
}

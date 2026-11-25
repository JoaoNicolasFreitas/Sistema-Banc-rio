package com.sistema.admin.mapper;

import com.sistema.admin.dto.AuthUserDto;
import com.sistema.admin.dto.PerfilDto;
import com.sistema.admin.entity.Perfil;
import com.sistema.admin.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class AuthMapper {

    public AuthUserDto toAuthUserDto(Usuario usuario) {
        return new AuthUserDto(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().getNome(),
                usuario.isAtivo(),
                usuario.getUltimoAcessoEm(),
                usuario.getCriadoEm()
        );
    }

    public PerfilDto toPerfilDto(Perfil perfil) {
        return new PerfilDto(perfil.getId(), perfil.getNome(), perfil.getDescricao());
    }
}

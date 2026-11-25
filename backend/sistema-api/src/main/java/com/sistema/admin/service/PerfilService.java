package com.sistema.admin.service;

import com.sistema.admin.dto.AlterarSenhaRequest;
import com.sistema.admin.dto.AuthUserDto;
import com.sistema.admin.dto.PerfilDto;
import com.sistema.admin.dto.PerfilUpdateRequest;
import com.sistema.admin.entity.Usuario;
import com.sistema.admin.exception.BusinessException;
import com.sistema.admin.exception.ConflictException;
import com.sistema.admin.exception.ResourceNotFoundException;
import com.sistema.admin.mapper.AuthMapper;
import com.sistema.admin.repository.PerfilRepository;
import com.sistema.admin.repository.RefreshTokenRepository;
import com.sistema.admin.repository.UsuarioRepository;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PerfilService {

    private final PerfilRepository perfilRepository;
    private final UsuarioRepository usuarioRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthMapper authMapper;
    private final AuditoriaService auditoriaService;

    public PerfilService(
            PerfilRepository perfilRepository,
            UsuarioRepository usuarioRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuthMapper authMapper,
            AuditoriaService auditoriaService) {
        this.perfilRepository = perfilRepository;
        this.usuarioRepository = usuarioRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authMapper = authMapper;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public List<PerfilDto> listarPerfis() {
        return perfilRepository.findAll().stream()
                .map(authMapper::toPerfilDto)
                .toList();
    }

    @Transactional
    public AuthUserDto atualizarPerfilProprio(Long userId, PerfilUpdateRequest request, String ipOrigem) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        String emailNormalized = request.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCaseAndIdNot(emailNormalized, userId)) {
            throw new ConflictException("Já existe outro usuário cadastrado com este e-mail.");
        }

        usuario.setNome(request.nome().trim());
        usuario.setEmail(emailNormalized);
        Usuario saved = usuarioRepository.save(usuario);

        auditoriaService.registrar(saved, saved.getEmail(), "ATUALIZACAO", "USUARIO",
                String.valueOf(saved.getId()), "Usuário atualizou os próprios dados cadastrais.", ipOrigem);

        return authMapper.toAuthUserDto(saved);
    }

    @Transactional
    public void alterarSenhaPropria(Long userId, AlterarSenhaRequest request, String ipOrigem) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));

        if (!passwordEncoder.matches(request.senhaAtual(), usuario.getSenhaHash())) {
            throw new BusinessException("A senha atual informada está incorreta.");
        }

        if (passwordEncoder.matches(request.novaSenha(), usuario.getSenhaHash())) {
            throw new BusinessException("A nova senha deve ser diferente da senha atual.");
        }

        usuario.setSenhaHash(passwordEncoder.encode(request.novaSenha()));
        usuarioRepository.save(usuario);
        refreshTokenRepository.revokeAllByUsuarioId(usuario.getId());

        auditoriaService.registrar(usuario, usuario.getEmail(), "SENHA_ALTERADA", "USUARIO",
                String.valueOf(usuario.getId()), "Usuário alterou a própria senha.", ipOrigem);
    }
}

package com.sistema.admin.service;

import com.sistema.admin.dto.UsuarioCreateRequest;
import com.sistema.admin.dto.UsuarioDto;
import com.sistema.admin.dto.UsuarioUpdateRequest;
import com.sistema.admin.entity.Perfil;
import com.sistema.admin.entity.Usuario;
import com.sistema.admin.exception.ConflictException;
import com.sistema.admin.exception.ResourceNotFoundException;
import com.sistema.admin.mapper.UsuarioMapper;
import com.sistema.admin.repository.PerfilRepository;
import com.sistema.admin.repository.UsuarioRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper usuarioMapper;
    private final AuditoriaService auditoriaService;

    public UsuarioService(UsuarioRepository usuarioRepository, PerfilRepository perfilRepository,
                          PasswordEncoder passwordEncoder, UsuarioMapper usuarioMapper,
                          AuditoriaService auditoriaService) {
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.passwordEncoder = passwordEncoder;
        this.usuarioMapper = usuarioMapper;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(readOnly = true)
    public Page<UsuarioDto> listar(String busca, String perfil, Boolean ativo, Pageable pageable) {
        Specification<Usuario> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (busca != null && !busca.isBlank()) {
                String like = "%" + busca.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("nome")), like),
                        cb.like(cb.lower(root.get("email")), like)));
            }
            if (perfil != null && !perfil.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("perfil").get("nome")), perfil.toUpperCase()));
            }
            if (ativo != null) {
                predicates.add(cb.equal(root.get("ativo"), ativo));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        return usuarioRepository.findAll(spec, pageable).map(usuarioMapper::toDto);
    }

    @Transactional(readOnly = true)
    public UsuarioDto buscar(Long id) {
        return usuarioMapper.toDto(usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado.")));
    }

    @Transactional
    public UsuarioDto criar(UsuarioCreateRequest request, Usuario responsavel, String ip) {
        String email = request.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Já existe um usuário com este e-mail.");
        }
        Perfil perfil = perfilRepository.findByNomeIgnoreCase(request.perfil())
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado."));
        Usuario usuario = new Usuario();
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(request.senha()));
        usuario.setPerfil(perfil);
        usuario.setAtivo(Boolean.TRUE.equals(request.ativo()));
        usuario = usuarioRepository.save(usuario);
        auditoriaService.registrar(responsavel, responsavel != null ? responsavel.getEmail() : null,
                "CRIACAO", "USUARIO", String.valueOf(usuario.getId()), "Usuário criado.", ip);
        return usuarioMapper.toDto(usuario);
    }

    @Transactional
    public UsuarioDto atualizar(Long id, UsuarioUpdateRequest request, Usuario responsavel, String ip) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
        String email = request.email().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
            throw new ConflictException("Já existe outro usuário com este e-mail.");
        }
        Perfil perfil = perfilRepository.findByNomeIgnoreCase(request.perfil())
                .orElseThrow(() -> new ResourceNotFoundException("Perfil não encontrado."));
        usuario.setNome(request.nome().trim());
        usuario.setEmail(email);
        usuario.setPerfil(perfil);
        usuario.setAtivo(Boolean.TRUE.equals(request.ativo()));
        usuario = usuarioRepository.save(usuario);
        auditoriaService.registrar(responsavel, responsavel != null ? responsavel.getEmail() : null,
                "ATUALIZACAO", "USUARIO", String.valueOf(id), "Usuário atualizado.", ip);
        return usuarioMapper.toDto(usuario);
    }

    @Transactional
    public UsuarioDto alterarStatus(Long id, boolean ativo, Usuario responsavel, String ip) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado."));
        usuario.setAtivo(ativo);
        usuario = usuarioRepository.save(usuario);
        auditoriaService.registrar(responsavel, responsavel != null ? responsavel.getEmail() : null,
                "ALTERACAO_STATUS", "USUARIO", String.valueOf(id),
                ativo ? "Usuário ativado." : "Usuário desativado.", ip);
        return usuarioMapper.toDto(usuario);
    }
}

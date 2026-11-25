package com.sistema.admin.service;

import com.sistema.admin.dto.AuthResponse;
import com.sistema.admin.dto.AuthUserDto;
import com.sistema.admin.dto.ForgotPasswordRequest;
import com.sistema.admin.dto.LoginRequest;
import com.sistema.admin.dto.RefreshTokenRequest;
import com.sistema.admin.entity.ConfiguracaoSistema;
import com.sistema.admin.entity.RefreshToken;
import com.sistema.admin.entity.Usuario;
import com.sistema.admin.exception.AccountLockedException;
import com.sistema.admin.exception.ResourceNotFoundException;
import com.sistema.admin.mapper.AuthMapper;
import com.sistema.admin.repository.ConfiguracaoSistemaRepository;
import com.sistema.admin.repository.RefreshTokenRepository;
import com.sistema.admin.repository.UsuarioRepository;
import com.sistema.admin.security.AuthenticatedUser;
import com.sistema.admin.security.JwtService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UsuarioRepository usuarioRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ConfiguracaoSistemaRepository configuracaoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthMapper authMapper;
    private final AuditoriaService auditoriaService;

    @Value("${app.security.login-rate-limit.max-attempts:5}")
    private int defaultMaxAttempts;

    @Value("${app.security.login-rate-limit.lock-minutes:15}")
    private int defaultLockMinutes;

    public AuthService(
            UsuarioRepository usuarioRepository,
            RefreshTokenRepository refreshTokenRepository,
            ConfiguracaoSistemaRepository configuracaoRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthMapper authMapper,
            AuditoriaService auditoriaService) {
        this.usuarioRepository = usuarioRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.configuracaoRepository = configuracaoRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authMapper = authMapper;
        this.auditoriaService = auditoriaService;
    }

    @Transactional(noRollbackFor = {BadCredentialsException.class, AccountLockedException.class, DisabledException.class})
    public AuthResponse login(LoginRequest request, String ipOrigem) {
        String emailNormalized = request.email().trim().toLowerCase();
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(emailNormalized)
                .orElseThrow(() -> {
                    auditoriaService.registrar(null, emailNormalized, "LOGIN_FALHA", "AUTH", null,
                            "Tentativa de login com e-mail não cadastrado.", ipOrigem);
                    return new BadCredentialsException("E-mail ou senha inválidos.");
                });

        if (!usuario.isAtivo()) {
            auditoriaService.registrar(usuario, usuario.getEmail(), "LOGIN_FALHA", "AUTH",
                    String.valueOf(usuario.getId()), "Tentativa de login em conta desativada.", ipOrigem);
            throw new DisabledException("Conta de usuário desativada. Contate o administrador.");
        }

        Instant now = Instant.now();
        if (usuario.getBloqueadoAte() != null && usuario.getBloqueadoAte().isAfter(now)) {
            auditoriaService.registrar(usuario, usuario.getEmail(), "LOGIN_FALHA", "AUTH",
                    String.valueOf(usuario.getId()), "Tentativa de login durante bloqueio temporário.", ipOrigem);
            throw new AccountLockedException("Muitas tentativas inválidas. Tente novamente em alguns minutos.");
        }

        if (!passwordEncoder.matches(request.senha(), usuario.getSenhaHash())) {
            int maxAttempts = getIntConfig("seguranca.max_tentativas_login", defaultMaxAttempts);
            int lockMinutes = getIntConfig("seguranca.minutos_bloqueio", defaultLockMinutes);
            int attempts = usuario.getTentativasFalhas() + 1;
            usuario.setTentativasFalhas(attempts);
            if (attempts >= maxAttempts) {
                usuario.setBloqueadoAte(now.plus(lockMinutes, ChronoUnit.MINUTES));
                usuario.setTentativasFalhas(0);
            }
            usuarioRepository.save(usuario);
            auditoriaService.registrar(usuario, usuario.getEmail(), "LOGIN_FALHA", "AUTH",
                    String.valueOf(usuario.getId()), "Senha incorreta informada no login.", ipOrigem);
            throw new BadCredentialsException("E-mail ou senha inválidos.");
        }

        usuario.setTentativasFalhas(0);
        usuario.setBloqueadoAte(null);
        usuario.setUltimoAcessoEm(now);
        usuarioRepository.save(usuario);

        if (isBooleanConfig("seguranca.auditoria_login", true)) {
            auditoriaService.registrar(usuario, usuario.getEmail(), "LOGIN", "AUTH",
                    String.valueOf(usuario.getId()), "Autenticação realizada com sucesso.", ipOrigem);
        }

        return issueTokens(usuario);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String tokenHash = sha256Hex(request.refreshToken());
        RefreshToken existing = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BadCredentialsException("Refresh token inválido."));

        if (existing.isRevogado() || existing.getExpiraEm().isBefore(Instant.now())) {
            throw new BadCredentialsException("Refresh token expirado ou revogado.");
        }

        Usuario usuario = existing.getUsuario();
        if (!usuario.isAtivo()) {
            throw new DisabledException("Conta de usuário desativada.");
        }

        existing.setRevogado(true);
        refreshTokenRepository.save(existing);

        return issueTokens(usuario);
    }

    @Transactional
    public void logout(RefreshTokenRequest request, AuthenticatedUser currentUser, String ipOrigem) {
        if (request != null && request.refreshToken() != null && !request.refreshToken().isBlank()) {
            refreshTokenRepository.findByTokenHash(sha256Hex(request.refreshToken()))
                    .ifPresent(rt -> {
                        rt.setRevogado(true);
                        refreshTokenRepository.save(rt);
                    });
        }
        if (currentUser != null && isBooleanConfig("seguranca.auditoria_login", true)) {
            Usuario userRef = usuarioRepository.findById(currentUser.getId()).orElse(null);
            auditoriaService.registrar(userRef, currentUser.getEmail(), "LOGOUT", "AUTH",
                    String.valueOf(currentUser.getId()), "Encerramento de sessão.", ipOrigem);
        }
    }

    @Transactional(readOnly = true)
    public AuthUserDto me(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário autenticado não encontrado."));
        return authMapper.toAuthUserDto(usuario);
    }

    @Transactional
    public void solicitarRecuperacaoSenha(ForgotPasswordRequest request, String ipOrigem) {
        String email = request.email().trim().toLowerCase();
        usuarioRepository.findByEmailIgnoreCase(email).ifPresent(usuario ->
                auditoriaService.registrar(usuario, usuario.getEmail(), "RECUPERACAO_SENHA", "AUTH",
                        String.valueOf(usuario.getId()),
                        "Solicitação de recuperação de senha registrada.", ipOrigem)
        );
    }

    private AuthResponse issueTokens(Usuario usuario) {
        AuthenticatedUser principal = new AuthenticatedUser(usuario);
        String accessToken = jwtService.generateAccessToken(principal);
        String rawRefreshToken = generateOpaqueToken();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUsuario(usuario);
        refreshToken.setTokenHash(sha256Hex(rawRefreshToken));
        refreshToken.setExpiraEm(Instant.now().plusMillis(jwtService.getRefreshExpirationMs()));
        refreshToken.setRevogado(false);
        refreshTokenRepository.save(refreshToken);

        return new AuthResponse(
                accessToken,
                rawRefreshToken,
                "Bearer",
                jwtService.getAccessExpirationSeconds(),
                authMapper.toAuthUserDto(usuario)
        );
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[48];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 indisponível.", ex);
        }
    }

    private int getIntConfig(String key, int fallback) {
        return configuracaoRepository.findByChave(key)
                .map(ConfiguracaoSistema::getValor)
                .map(val -> {
                    try {
                        return Integer.parseInt(val.trim());
                    } catch (NumberFormatException e) {
                        return fallback;
                    }
                })
                .orElse(fallback);
    }

    private boolean isBooleanConfig(String key, boolean fallback) {
        return configuracaoRepository.findByChave(key)
                .map(ConfiguracaoSistema::getValor)
                .map(val -> Boolean.parseBoolean(val.trim()))
                .orElse(fallback);
    }
}

package com.sistema.admin.config;

import com.sistema.admin.entity.Perfil;
import com.sistema.admin.entity.Usuario;
import com.sistema.admin.repository.PerfilRepository;
import com.sistema.admin.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);

    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.name:Administrador}")
    private String adminName;

    @Value("${app.bootstrap.admin.email:}")
    private String adminEmail;

    @Value("${app.bootstrap.admin.password:}")
    private String adminPassword;

    public AdminBootstrapRunner(
            UsuarioRepository usuarioRepository,
            PerfilRepository perfilRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.perfilRepository = perfilRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (usuarioRepository.existsByPerfilNome("ADMIN")) {
            return;
        }

        if (adminEmail == null || adminEmail.isBlank() || adminPassword == null || adminPassword.isBlank()) {
            log.warn("Nenhum usuário ADMIN encontrado e ADMIN_BOOTSTRAP_EMAIL/ADMIN_BOOTSTRAP_PASSWORD não foram definidos. "
                    + "Configure essas variáveis de ambiente para inicializar o administrador.");
            return;
        }

        Perfil perfilAdmin = perfilRepository.findByNomeIgnoreCase("ADMIN")
                .orElseThrow(() -> new IllegalStateException("Perfil ADMIN não encontrado na base."));

        Usuario admin = new Usuario();
        admin.setNome(adminName.isBlank() ? "Administrador" : adminName.trim());
        admin.setEmail(adminEmail.trim().toLowerCase());
        admin.setSenhaHash(passwordEncoder.encode(adminPassword));
        admin.setPerfil(perfilAdmin);
        admin.setAtivo(true);
        usuarioRepository.save(admin);

        log.info("Usuário administrador inicial criado com sucesso para o e-mail configurado: {}", admin.getEmail());
    }
}

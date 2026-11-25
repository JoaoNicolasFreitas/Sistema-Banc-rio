CREATE TABLE perfis (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_perfis PRIMARY KEY (id),
    CONSTRAINT uk_perfis_nome UNIQUE (nome)
);

CREATE TABLE usuarios (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    perfil_id BIGINT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    tentativas_falhas INT NOT NULL DEFAULT 0,
    bloqueado_ate TIMESTAMP NULL,
    ultimo_acesso_em TIMESTAMP NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_usuarios PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_email UNIQUE (email),
    CONSTRAINT fk_usuarios_perfil FOREIGN KEY (perfil_id) REFERENCES perfis (id)
);

CREATE INDEX idx_usuarios_nome ON usuarios (nome);
CREATE INDEX idx_usuarios_ativo ON usuarios (ativo);
CREATE INDEX idx_usuarios_perfil_id ON usuarios (perfil_id);
CREATE INDEX idx_usuarios_criado_em ON usuarios (criado_em);

CREATE TABLE refresh_tokens (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT NOT NULL,
    token_hash VARCHAR(128) NOT NULL,
    expira_em TIMESTAMP NOT NULL,
    revogado BOOLEAN NOT NULL DEFAULT FALSE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
    CONSTRAINT uk_refresh_tokens_hash UNIQUE (token_hash),
    CONSTRAINT fk_refresh_tokens_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_usuario_id ON refresh_tokens (usuario_id);

CREATE TABLE cursos (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    codigo VARCHAR(40) NOT NULL,
    descricao VARCHAR(1000) NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_cursos PRIMARY KEY (id),
    CONSTRAINT uk_cursos_codigo UNIQUE (codigo)
);

CREATE INDEX idx_cursos_nome ON cursos (nome);
CREATE INDEX idx_cursos_ativo ON cursos (ativo);
CREATE INDEX idx_cursos_criado_em ON cursos (criado_em);

CREATE TABLE disciplinas (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    codigo VARCHAR(40) NOT NULL,
    descricao VARCHAR(1000) NULL,
    carga_horaria INT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_disciplinas PRIMARY KEY (id),
    CONSTRAINT uk_disciplinas_codigo UNIQUE (codigo)
);

CREATE INDEX idx_disciplinas_nome ON disciplinas (nome);
CREATE INDEX idx_disciplinas_ativo ON disciplinas (ativo);

CREATE TABLE curso_disciplinas (
    curso_id BIGINT NOT NULL,
    disciplina_id BIGINT NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_curso_disciplinas PRIMARY KEY (curso_id, disciplina_id),
    CONSTRAINT fk_curso_disciplinas_curso FOREIGN KEY (curso_id) REFERENCES cursos (id) ON DELETE CASCADE,
    CONSTRAINT fk_curso_disciplinas_disciplina FOREIGN KEY (disciplina_id) REFERENCES disciplinas (id) ON DELETE CASCADE
);

CREATE TABLE auditoria (
    id BIGINT NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT NULL,
    usuario_email VARCHAR(180) NULL,
    acao VARCHAR(60) NOT NULL,
    entidade VARCHAR(60) NOT NULL,
    entidade_id VARCHAR(60) NULL,
    detalhes VARCHAR(1000) NULL,
    ip_origem VARCHAR(64) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_auditoria PRIMARY KEY (id),
    CONSTRAINT fk_auditoria_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE SET NULL
);

CREATE INDEX idx_auditoria_usuario_id ON auditoria (usuario_id);
CREATE INDEX idx_auditoria_acao ON auditoria (acao);
CREATE INDEX idx_auditoria_entidade ON auditoria (entidade);
CREATE INDEX idx_auditoria_criado_em ON auditoria (criado_em);

CREATE TABLE configuracoes_sistema (
    id BIGINT NOT NULL AUTO_INCREMENT,
    chave VARCHAR(80) NOT NULL,
    valor VARCHAR(500) NOT NULL,
    descricao VARCHAR(255) NULL,
    categoria VARCHAR(50) NOT NULL,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_configuracoes_sistema PRIMARY KEY (id),
    CONSTRAINT uk_configuracoes_chave UNIQUE (chave)
);

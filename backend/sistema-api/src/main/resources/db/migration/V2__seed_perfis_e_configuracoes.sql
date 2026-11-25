INSERT INTO perfis (nome, descricao) VALUES
    ('ADMIN', 'Administrador com acesso total ao sistema, usuários, permissões, configurações e auditoria'),
    ('GESTOR', 'Gestor responsável pela administração de cursos, disciplinas e consulta de usuários'),
    ('OPERADOR', 'Operador com acesso de consulta às informações autorizadas');

INSERT INTO configuracoes_sistema (chave, valor, descricao, categoria) VALUES
    ('sistema.nome', 'NexusAdmin', 'Nome oficial exibido na interface administrativa', 'GERAL'),
    ('sistema.instituicao', 'Instituição de Ensino Corporativa', 'Nome da organização ou instituição mantenedora', 'GERAL'),
    ('sistema.email_suporte', 'suporte@sistema.local', 'E-mail de contato para suporte aos usuários', 'GERAL'),
    ('sistema.itens_por_pagina', '10', 'Quantidade padrão de registros por página nas listagens', 'PREFERENCIAS'),
    ('sistema.manutencao_ativa', 'false', 'Indica se avisos de manutenção programada estão ativos', 'PREFERENCIAS'),
    ('seguranca.max_tentativas_login', '5', 'Número máximo de tentativas inválidas antes do bloqueio temporário', 'SEGURANCA'),
    ('seguranca.minutos_bloqueio', '15', 'Tempo em minutos de bloqueio após exceder tentativas inválidas', 'SEGURANCA'),
    ('seguranca.auditoria_login', 'true', 'Registrar eventos de login e logout na trilha de auditoria', 'SEGURANCA');

# Arquitetura e Decisões Técnicas

## Matriz de Compatibilidade Verificada

| Camada | Tecnologia | Versão |
|---|---|---|
| Runtime Backend | Java LTS | 25.0.2 |
| Framework Backend | Spring Boot | 3.5.16 |
| Documentação API | springdoc-openapi-starter-webmvc-ui | 2.8.17 |
| Autenticação JWT | io.jsonwebtoken (JJWT) | 0.12.7 |
| Migrations | Flyway (`flyway-core` + `flyway-mysql`) | Gerenciada pelo Spring Boot / compatível MySQL 8.4 |
| Banco de Dados | MySQL LTS | 8.4 |
| Framework Frontend | Angular | 22.3.0 |
| UI Kit | Angular Material / CDK | 22.3.0 |
| Gráficos | ng2-charts + Chart.js | Chart.js 4.6.2 + ng2-charts (peer Angular >= 22) |

## Decisões Arquiteturais Iniciais

1. **Monorepositório estruturado**: separação clara entre `backend/sistema-api`, `frontend/sistema-angular`, `infra` e `docs`.
2. **Segurança stateless + Refresh Token**: access token JWT de curta duração + refresh token rotativo validado no backend, com BCrypt para hash de senhas e bloqueio temporário após tentativas inválidas de login.
3. **Bootstrap seguro de administrador**: o administrador inicial é criado via `ApplicationRunner` lendo variáveis de ambiente (`ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`) apenas quando não existe usuário `ADMIN` na base, evitando senhas hardcoded no código-fonte ou em migrations SQL.
4. **Migrations estritas**: `spring.jpa.hibernate.ddl-auto=validate` em produção/desenvolvimento com MySQL e schema gerenciado exclusivamente pelo Flyway.

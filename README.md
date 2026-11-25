# Sistema Administrativo Web

Sistema administrativo web full-stack desenvolvido com **Java 25 + Spring Boot 3.5.16**, **Angular 22 + Angular Material**, **MySQL 8.4 LTS** e **Docker**.

## Arquitetura do Monorepositório

```text
sistema-administrativo/
├── frontend/
│   └── sistema-angular/      # Aplicação Angular 22 + Angular Material + Chart.js
├── backend/
│   └── sistema-api/          # API REST Spring Boot 3.5.16 + Java 25 + Flyway + Spring Security (JWT)
├── infra/
│   ├── docker-compose.yml    # Orquestração MySQL 8.4 LTS, API e Frontend
│   └── .env.example          # Modelo de variáveis de ambiente
├── docs/
│   └── architecture.md       # Decisões técnicas, modelagem e matriz de compatibilidade
├── README.md
└── .gitignore
```

## Tecnologias

- **Backend:** Java 25, Spring Boot 3.5.16, Spring Web, Spring Security, Spring Data JPA, Hibernate, Spring Validation, Spring Boot Actuator, Flyway, Springdoc OpenAPI (2.8.17), JJWT (0.12.7), BCrypt, Maven.
- **Frontend:** Angular 22.3, TypeScript, Angular Material 22.3, Reactive Forms, HttpClient (Functional Interceptors), Route Guards, RxJS, SCSS, Chart.js + ng2-charts.
- **Banco de Dados:** MySQL 8.4 LTS com migrations via Flyway.
- **Infraestrutura:** Docker e Docker Compose.

## Pré-requisitos

- Java 25+
- Maven 3.9+
- Node.js 22+ e npm 10+
- MySQL 8.4 LTS (ou Docker + Docker Compose)

## Variáveis de Ambiente

Copie `infra/.env.example` para `infra/.env` (ou defina no ambiente do sistema) antes de executar:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DB_HOST` | Host do MySQL | `localhost` |
| `DB_PORT` | Porta do MySQL | `3306` |
| `DB_NAME` | Nome do banco | `sistema_admin` |
| `DB_USER` | Usuário do banco | `sistema_user` |
| `DB_PASSWORD` | Senha do banco | *(definida via ambiente)* |
| `JWT_SECRET` | Chave HMAC-SHA256 (>= 32 bytes Base64) | *(gerada via openssl)* |
| `ADMIN_BOOTSTRAP_EMAIL` | E-mail do admin inicial (opcional) | `admin@sistema.local` |
| `ADMIN_BOOTSTRAP_PASSWORD` | Senha do admin inicial (obrigatória no 1º bootstrap se não existir admin) | *(definida via ambiente)* |

## Execução

### Execução completa com Docker

1. Ajuste as credenciais locais em `infra/.env`, se necessário.
2. Execute na raiz do projeto:

```powershell
docker compose --env-file infra/.env -f infra/docker-compose.yml up --build
```

3. Acesse:
   - Aplicação: http://localhost:4200
   - API: http://localhost:8080/api/v1
   - Swagger: http://localhost:8080/swagger-ui.html
   - MySQL: localhost:3306

O usuário administrador inicial é criado no primeiro bootstrap a partir das variáveis `ADMIN_BOOTSTRAP_EMAIL` e `ADMIN_BOOTSTRAP_PASSWORD`.

### Execução separada

Backend:

```powershell
cd backend/sistema-api
mvn spring-boot:run
```

Frontend:

```powershell
cd frontend/sistema-angular
npm start
```

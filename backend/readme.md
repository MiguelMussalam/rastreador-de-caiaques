# Rastreador de Caiaques — Backend API

Sistema de monitoramento em tempo real da frota de caiaques da **Xtreme Caiaques**. O backend é responsável por receber os dados de localização enviados pela estação base LoRa, armazená-los e disponibilizá-los para o dashboard web.

---

## Índice

1. [Visão Geral](#visão-geral)
2. [Stack Tecnológica](#stack-tecnológica)
3. [Arquitetura](#arquitetura)
4. [Estrutura de Pastas](#estrutura-de-pastas)
5. [Pré-requisitos](#pré-requisitos)
6. [Instalação e Configuração](#instalação-e-configuração)
7. [Endpoints da API](#endpoints-da-api)
8. [Modelos de Dados](#modelos-de-dados)
9. [Testes](#testes)
10. [Próximas Etapas](#próximas-etapas)

---

## Visão Geral

O sistema é composto por três partes principais:

```
Hardware (Arduino + GPS + LoRa)
        ↓
Estação Base (ESP32 + LoRa)
        ↓
Backend API (este projeto)
        ↓
Dashboard Web (frontend — Next.js)
```

O backend recebe os pontos de rastreamento GPS enviados pela estação base, processa e armazena no banco de dados, e disponibiliza as informações via API REST para o dashboard do operador.

---

## Stack Tecnológica

| Tecnologia | Versão | Função |
|---|---|---|
| Node.js | 18+ | Runtime |
| TypeScript | 5.3 | Linguagem |
| NestJS | 10.3 | Framework web |
| PostgreSQL | 15+ | Banco de dados |
| Prisma | 5.7 | ORM |
| Jest | 29.7 | Testes unitários |

---

## Arquitetura

O projeto segue os princípios da **Clean Architecture**, dividindo o código em camadas com dependências que sempre apontam para dentro — as camadas mais internas não conhecem as mais externas.

```
┌─────────────────────────────────┐
│           Presentation          │  Controllers REST
├─────────────────────────────────┤
│          Infrastructure         │  Repositórios, Prisma, Configs
├─────────────────────────────────┤
│           Application           │  Use Cases, DTOs
├─────────────────────────────────┤
│             Domain              │  Entidades, Interfaces
└─────────────────────────────────┘
         ↑ dependências apontam para dentro
```

### Por que Clean Architecture?

- **Testabilidade** — os use cases são testados sem banco de dados, usando mocks
- **Flexibilidade** — é possível trocar o PostgreSQL por outro banco sem tocar na lógica de negócio
- **Separação de responsabilidades** — cada camada tem um papel bem definido

### Camadas

**Domain** — o núcleo do sistema. Contém as entidades (`User`, `Kayak`, `TrackingPoint`) e as interfaces dos repositórios. Não depende de nenhuma biblioteca externa.

**Application** — contém os casos de uso (regras de negócio) e os DTOs (objetos de transferência de dados com validação). Depende apenas do Domain.

**Infrastructure** — implementações concretas dos repositórios usando Prisma + PostgreSQL. Depende do Domain e do Application.

**Presentation** — controllers REST que recebem as requisições HTTP, chamam os use cases e retornam as respostas. Depende do Application.

---

## Estrutura de Pastas

```
backend/
├── prisma/
│   └── schema.prisma              # Definição dos models do banco de dados
│
├── src/
│   ├── main.ts                    # Ponto de entrada da aplicação
│   ├── app.module.ts              # Módulo principal — registra tudo
│   │
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── kayak.entity.ts
│   │   │   └── tracking-point.entity.ts
│   │   └── repositories/
│   │       ├── user.repository.ts
│   │       ├── kayak.repository.ts
│   │       └── tracking-point.repository.ts
│   │
│   ├── application/
│   │   ├── dtos/
│   │   │   ├── user.dto.ts
│   │   │   ├── kayak.dto.ts
│   │   │   └── tracking-point.dto.ts
│   │   └── use-cases/
│   │       ├── user/
│   │       │   ├── user.use-cases.ts
│   │       │   └── user.use-cases.spec.ts
│   │       ├── kayak/
│   │       │   ├── kayak.use-cases.ts
│   │       │   └── kayak.use-cases.spec.ts
│   │       └── tracking/
│   │           ├── tracking.use-cases.ts
│   │           └── tracking.use-cases.spec.ts
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── prisma.service.ts
│   │   └── repositories/
│   │       └── repositories.impl.ts
│   │
│   └── presentation/
│       ├── controllers/
│       │   ├── user.controller.ts
│       │   ├── kayak.controller.ts
│       │   └── tracking.controller.ts
│       └── middlewares/
│           └── exception.filter.ts
│
├── .env.example                   # Template das variáveis de ambiente
├── .env                           # Variáveis de ambiente reais (não vai pro Git)
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

---

## Pré-requisitos

- [Node.js 18+](https://nodejs.org)
- [PostgreSQL 15+](https://www.postgresql.org/download/)
- npm (vem junto com o Node.js)

---

## Instalação e Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo de exemplo e edite com suas credenciais:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/kayak_tracker"
PORT=3001
NODE_ENV=development
```

### 3. Criar o banco de dados

No pgAdmin ou psql:

```sql
CREATE DATABASE kayak_tracker;
```

### 4. Rodar as migrations

```bash
npx prisma migrate dev --name init
```

Isso cria todas as tabelas no banco automaticamente a partir do `schema.prisma`.

### 5. Subir o servidor

```bash
npm run start:dev
```

Se tudo estiver certo, você verá:

```
🚀 Kayak Tracker API rodando em http://localhost:3001
```

---

## Endpoints da API

### Usuários — `/api/v1/users`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/v1/users` | Cria um usuário |
| `GET` | `/api/v1/users` | Lista todos os usuários |
| `GET` | `/api/v1/users/:id` | Busca usuário por ID |
| `PATCH` | `/api/v1/users/:id` | Atualiza usuário |
| `DELETE` | `/api/v1/users/:id` | Remove usuário |

**Criar usuário — POST /api/v1/users**
```json
{
  "username": "operador01",
  "password": "senha123",
  "role": "OPERATOR"
}
```

**Resposta:**
```json
{
  "id": "uuid",
  "username": "operador01",
  "role": "OPERATOR",
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Atualizar usuário — PATCH /api/v1/users/:id** *(todos os campos opcionais)*
```json
{
  "password": "novasenha123",
  "role": "ADMIN",
  "active": false
}
```

Roles disponíveis: `ADMIN`, `OPERATOR`

---

### Caiaques — `/api/v1/kayaks`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/v1/kayaks` | Registra um caiaque |
| `GET` | `/api/v1/kayaks` | Lista todos (aceita `?status=IN_USE`) |
| `GET` | `/api/v1/kayaks/:id` | Busca caiaque por ID |
| `PATCH` | `/api/v1/kayaks/:id` | Atualiza caiaque |
| `DELETE` | `/api/v1/kayaks/:id` | Remove caiaque |

**Registrar caiaque — POST /api/v1/kayaks**
```json
{
  "code": "KYK-001",
  "name": "Caiaque Alpha"
}
```

**Resposta:**
```json
{
  "id": "uuid",
  "code": "KYK-001",
  "name": "Caiaque Alpha",
  "status": "AVAILABLE",
  "active": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

**Atualizar caiaque — PATCH /api/v1/kayaks/:id** *(todos os campos opcionais)*
```json
{
  "name": "Novo nome",
  "status": "IN_USE",
  "active": false
}
```

Status disponíveis: `AVAILABLE`, `IN_USE`, `MAINTENANCE`, `ALERT`

---

### Rastreamento — `/api/v1/tracking`

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/v1/tracking` | Ingere ponto GPS da estação base |
| `GET` | `/api/v1/tracking/kayaks/:id/latest` | Última posição do caiaque |
| `GET` | `/api/v1/tracking/kayaks/:id/history` | Histórico de rota por período |
| `GET` | `/api/v1/tracking/kayaks/:id` | Rota completa do caiaque |

**Ingerir ponto GPS — POST /api/v1/tracking**

*Chamado pela estação base ao receber dados do hardware LoRa.*

```json
{
  "kayakId": "uuid-do-caiaque",
  "latitude": -23.9618,
  "longitude": -46.3322,
  "speedKmh": 4.5,
  "batteryLevel": 87
}
```

**Última posição — GET /api/v1/tracking/kayaks/:id/latest**

Retorna o ponto de rastreamento mais recente de um caiaque. Usado pelo dashboard para atualização em tempo real.

**Histórico por período — GET /api/v1/tracking/kayaks/:id/history**
```
?from=2025-01-01T08:00:00.000Z&to=2025-01-01T18:00:00.000Z
```

---

## Modelos de Dados

### User
| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único |
| username | String | Nome de usuário único |
| password | String | Senha (a ser hasheada com bcrypt) |
| role | Enum | `ADMIN` ou `OPERATOR` |
| active | Boolean | Se o usuário está ativo |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data de atualização |

### Kayak
| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único |
| code | String | Código único do caiaque (ex: KYK-001) |
| name | String | Nome do caiaque |
| status | Enum | `AVAILABLE`, `IN_USE`, `MAINTENANCE`, `ALERT` |
| active | Boolean | Se o caiaque está ativo |
| createdAt | DateTime | Data de criação |
| updatedAt | DateTime | Data de atualização |

### TrackingPoint
| Campo | Tipo | Descrição |
|---|---|---|
| id | UUID | Identificador único |
| kayakId | UUID | Referência ao caiaque |
| latitude | Float | Latitude GPS |
| longitude | Float | Longitude GPS |
| speedKmh | Float? | Velocidade em km/h (opcional) |
| batteryLevel | Int? | Nível de bateria 0-100 (opcional) |
| recordedAt | DateTime | Data e hora do registro |

---

## Testes

Os testes unitários cobrem todos os use cases e rodam sem necessidade de banco de dados, usando mocks.

```bash
# Rodar todos os testes
npm test

# Rodar com cobertura
npm run test:coverage

# Rodar em modo watch (re-executa ao salvar)
npm run test:watch
```

### Cobertura atual

| Use Case | Cenários testados |
|---|---|
| `CreateUserUseCase` | Criação com sucesso, username duplicado |
| `GetUserUseCase` | Busca por ID, usuário não encontrado, listar todos |
| `UpdateUserUseCase` | Atualização com sucesso, usuário não encontrado |
| `DeleteUserUseCase` | Deleção com sucesso, usuário não encontrado |
| `RegisterKayakUseCase` | Registro com sucesso, código duplicado |
| `GetKayakUseCase` | Busca por ID, não encontrado, filtro por status |
| `UpdateKayakUseCase` | Atualização de status |
| `DeleteKayakUseCase` | Deleção com sucesso, não encontrado |
| `IngestTrackingPointUseCase` | Ingestão com sucesso, caiaque não encontrado |
| `GetTrackingUseCase` | Última posição, sem pontos, histórico, rota completa |

---

## Próximas Etapas

- [ ] Hash de senha com **bcrypt**
- [ ] Autenticação com **JWT**
- [ ] **WebSockets** para atualização em tempo real do mapa
- [ ] Lógica de **geofencing** (alertas de zona militar restrita)
- [ ] Alertas de **tempo de aluguel**
- [ ] Frontend dashboard em **Next.js + React + TypeScript**
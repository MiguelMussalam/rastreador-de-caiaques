# Contexto do Projeto — Rastreador de Caiaques

## Sobre o Projeto
Sistema de monitoramento em tempo real da frota de caiaques da empresa **Xtreme Caiaques**, desenvolvido como TCC acadêmico com prazo de 1 ano.

O sistema rastreia caiaques via hardware (Arduino + GPS + LoRa) e exibe as informações num dashboard web para os operadores da empresa.

## Fluxo do Sistema
```
Hardware (Arduino Nano + GPS + LoRa)
        ↓
Estação Base (ESP32 + LoRa)
        ↓
Backend API (este projeto)
        ↓
Dashboard Web (frontend — Next.js)
```

## Stack Tecnológica

### Backend (pasta `/backend`)
- **Runtime:** Node.js 18+
- **Linguagem:** TypeScript
- **Framework:** NestJS 10
- **Banco de dados:** PostgreSQL
- **ORM:** Prisma
- **Testes:** Jest

### Frontend (ainda não iniciado)
- **Framework:** Next.js
- **Linguagem:** TypeScript
- **UI:** React + Tailwind CSS

## Arquitetura
Clean Architecture com 4 camadas. Dependências sempre apontam para dentro — Domain não conhece ninguém.

```
Presentation  → Controllers REST
Infrastructure → Repositórios Prisma
Application   → Use Cases + DTOs
Domain        → Entidades + Interfaces de repositório
```

## Estrutura de Pastas do Backend
```
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── kayak.entity.ts
│   │   │   └── tracking-point.entity.ts
│   │   └── repositories/
│   │       ├── user.repository.ts
│   │       ├── kayak.repository.ts
│   │       └── tracking-point.repository.ts
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
│   ├── infrastructure/
│   │   ├── database/
│   │   │   └── prisma.service.ts
│   │   └── repositories/
│   │       └── repositories.impl.ts
│   └── presentation/
│       ├── controllers/
│       │   ├── user.controller.ts
│       │   ├── kayak.controller.ts
│       │   └── tracking.controller.ts
│       └── middlewares/
│           └── exception.filter.ts
├── .env
├── .env.example
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

## Modelos de Dados

### User
- `id` UUID
- `username` String único
- `password` String (TODO: hash com bcrypt)
- `role` Enum: `ADMIN` | `OPERATOR`
- `active` Boolean
- `createdAt` / `updatedAt` DateTime

### Kayak
- `id` UUID
- `code` String único (ex: KYK-001)
- `name` String
- `status` Enum: `AVAILABLE` | `IN_USE` | `MAINTENANCE` | `ALERT`
- `active` Boolean
- `createdAt` / `updatedAt` DateTime

### TrackingPoint
- `id` UUID
- `kayakId` UUID (FK para Kayak)
- `latitude` / `longitude` Float
- `speedKmh` Float (opcional)
- `batteryLevel` Int 0-100 (opcional)
- `recordedAt` DateTime

## Endpoints da API

### Usuários — `/api/v1/users`
- `POST /` — cria usuário
- `GET /` — lista todos
- `GET /:id` — busca por ID
- `PATCH /:id` — atualiza
- `DELETE /:id` — remove

### Caiaques — `/api/v1/kayaks`
- `POST /` — registra caiaque
- `GET /` — lista todos (aceita `?status=IN_USE`)
- `GET /:id` — busca por ID
- `PATCH /:id` — atualiza
- `DELETE /:id` — remove

### Rastreamento — `/api/v1/tracking`
- `POST /` — ingere ponto GPS (chamado pela estação base)
- `GET /kayaks/:id/latest` — última posição
- `GET /kayaks/:id/history?from=&to=` — histórico por período
- `GET /kayaks/:id` — rota completa

## Decisões Técnicas Importantes

### Por que NestJS em vez de Spring Boot?
O desenvolvedor queria usar a mesma linguagem (TypeScript) no frontend e no backend, facilitando o desenvolvimento solo.

### Por que Prisma em vez de TypeORM?
Mais simples, melhor DX, schema centralizado no `schema.prisma`.

### Por que Clean Architecture?
Testabilidade — use cases são testados sem banco usando mocks. Flexibilidade para trocar banco ou framework sem tocar na lógica.

### Injeção de dependência com Symbol
O NestJS usa `Symbol` para fazer bind de interfaces (que não existem em runtime no TypeScript):
```typescript
export const USER_REPOSITORY = Symbol('IUserRepository')
// No app.module.ts:
{ provide: USER_REPOSITORY, useClass: UserRepositoryImpl }
```

### import type
Arquivos que importam apenas interfaces usam `import type` para evitar erro com `isolatedModules`:
```typescript
import type { IUserRepository } from '../repositories/user.repository'
import { USER_REPOSITORY } from '../repositories/user.repository'
```

## Status Atual
- [x] Backend estruturado com Clean Architecture
- [x] Entidades e repositórios do domínio
- [x] Use cases de User, Kayak e TrackingPoint
- [x] Repositórios implementados com Prisma
- [x] Controllers REST
- [x] Testes unitários (com problema de configuração sendo resolvido)
- [ ] Migrations do banco de dados
- [ ] Hash de senha com bcrypt
- [ ] Autenticação JWT
- [ ] WebSockets para tempo real
- [ ] Geofencing (zona militar restrita)
- [ ] Alertas de tempo de aluguel
- [ ] Frontend Next.js

## Problemas Conhecidos
- Testes unitários com erro `Cannot read properties of undefined` no `KayakStatus` — sendo investigado
- Causa provável: conflito entre `isolatedModules` e imports de enum em arquivos `.spec.ts`

## Ambiente de Desenvolvimento
- OS: Windows
- Editor: VS Code
- Terminal: PowerShell
- Node.js: 18+
- PostgreSQL rodando localmente
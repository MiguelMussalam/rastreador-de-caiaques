# Rastreador de Caiaques

Sistema de rastreamento de caiaques utilizando **ESP + GPS + LoRa**, com visualização em mapa através de uma aplicação web.

## Arquitetura

```
Caiaque (ESP + GPS + LoRa)
        ↓
   Receptor LoRa (ESP)
        ↓
        API
        ↓
      Banco
        ↓
     Interface Web (Mapa)
```

## Estrutura do projeto

```
firmware/       Código embarcado dos dispositivos ESP
backend/        API responsável por receber e armazenar os dados
frontend/       Interface web para visualização dos caiaques
documentacao/   Documentação técnica do projeto
```

### Firmware

Contém o código para os dispositivos embarcados.

```
firmware/
 ├─ transmissor/   ESP instalado no caiaque
 └─ receptor/      ESP gateway que recebe os pacotes LoRa
```

### Backend

API responsável por:

- receber dados de localização
- armazenar histórico
- disponibilizar endpoints para o frontend

Estrutura:

```
controllers/
models/
routes/
services/
```

### Frontend

Aplicação web responsável por:

- mostrar posição dos caiaques
- exibir dados em mapa
- consumir a API do backend

## Documentação

Detalhes técnicos podem ser encontrados em:

```
documentacao/arquitetura.md
documentacao/hardware.md
documentacao/protocolo.md
```

## Objetivo

Criar um sistema simples e de baixo custo para **rastreamento de caiaques em ambientes remotos**, utilizando comunicação **LoRa** para longa distância.

---
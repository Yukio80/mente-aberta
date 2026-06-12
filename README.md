# Mente Aberta

**Thinking Lab + Cérebro Coletivo** — uma plataforma de pensamento crítico assistida por IA.

## Visão Geral

O Mente Aberta combina duas ferramentas integradas:

### 🔬 Thinking Lab
Ferramenta privada para estruturar e analisar seu raciocínio com ajuda de **3 agentes de IA**:

| Agente | Função |
|--------|--------|
| **Agente Socrático** | Faz perguntas poderosas para aprofundar seu raciocínio |
| **Advogado do Diabo** | Desafia premissas e aponta pontos fracos |
| **Detector de Vieses** | Identifica vieses cognitivos (confirmação, ancoragem, disponibilidade etc.) |

Fluxo: crie um pensamento → analise com IA → adicione argumentos pró/contra → refine sua tese.

### 🧠 Cérebro Coletivo
Fórum público onde pensamentos são publicados em debates temáticos. A IA **sintetiza todas as contribuições** e revela:

- ✅ Pontos de consenso
- ⚡ Pontos de dissenso e tensão
- 🔍 Assunções ocultas
-  Vieses coletivos identificados
- 💡 Insights emergentes (conexões que ninguém percebeu sozinho)
-  Lacunas no debate

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Python 3.12+, FastAPI, SQLAlchemy, SQLite |
| Frontend | Next.js 16, React 19, Tailwind CSS 4, TypeScript |
| IA | OpenAI-compatible API (OpenRouter, OpenAI, etc.) |
| Infra | Docker Compose |

## Quick Start

### 1. Configure a chave de API

Edite `backend/.env`:

```env
OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-4o-mini
```

### 2. Suba com Docker

```bash
docker compose up -d
```

Acesse **http://localhost:3000**

### Sem Docker

```bash
# Terminal 1 - Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/thoughts` | Listar pensamentos |
| `POST` | `/api/thoughts` | Criar pensamento |
| `GET` | `/api/thoughts/{id}` | Detalhe do pensamento |
| `DELETE` | `/api/thoughts/{id}` | Excluir pensamento |
| `POST` | `/api/analysis/{id}/analyze` | Rodar análise dos 3 agentes (em paralelo) |
| `POST` | `/api/thoughts/{id}/arguments` | Adicionar argumento pró/contra |
| `GET` | `/api/forums` | Listar fóruns |
| `POST` | `/api/forums` | Criar fórum |
| `GET` | `/api/forums/{id}` | Detalhe do fórum |
| `POST` | `/api/publications` | Publicar pensamento no fórum |
| `GET` | `/api/publications/forum/{id}` | Publicações de um fórum |
| `POST` | `/api/synthesis/{id}/synthesize` | Gerar síntese do debate |
| `GET` | `/api/synthesis/{id}` | Listar sínteses |

## Estrutura do Projeto

```
mente-aberta/
├── backend/
│   ├── app/
│   │   ├── agents/           # Agentes de IA
│   │   │   ├── base.py       # Cliente OpenAI
│   │   │   ├── socratic.py   # Perguntas socráticas
│   │   │   ├── devil.py      # Advogado do diabo
│   │   │   ├── bias.py       # Detector de vieses
│   │   │   └── synthesis.py  # Síntese coletiva
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── routers/          # FastAPI routers
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # Dashboard
│   │   │   ├── layout.tsx           # Layout + nav
│   │   │   ├── thoughts/
│   │   │   │   ├── new/page.tsx     # Criar pensamento
│   │   │   │   └── [id]/page.tsx    # Detalhe + análises
│   │   │   └── forums/
│   │   │       ├── page.tsx         # Lista de fóruns
│   │   │       └── [id]/page.tsx    # Fórum + síntese
│   │   └── lib/
│   │       └── api.ts               # Cliente HTTP
│   ├── Dockerfile
│   └── .env.local
├── docker-compose.yml
└── README.md
```

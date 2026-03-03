# Sigma Challenge — Sistema de Gestão Agrícola

API REST desenvolvida em **FastAPI + PostgreSQL** com frontend em **React + Vite**, containerizada com **Docker**.

---

## Tecnologias

**Backend:** Python 3.12 · FastAPI · SQLAlchemy 2.0 · Alembic · PostgreSQL · JWT (PyJWT) · bcrypt  
**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS · React Hook Form · Zustand  
**Infraestrutura:** Docker · Docker Compose · Nginx

---
## Pré-requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e **rodando**
- Python 3.8+
- Git

---

## Instalação e Execução

### 1. Clonar o repositório

```bash
git clone https://github.com/vOdajze/sigma-challenge.git
cd sigma-challenge
```

### 2. Gerar o arquivo `.env`

```bash
python setup.py
```

> O script copia o `.env.example` e gera automaticamente senhas seguras para `DB_PASSWORD` e `SECRET_KEY`.  
> Execute apenas uma vez — se o `.env` já existir, nada é alterado.

### 3. Subir os containers

```bash
docker compose up --build
```

> Na primeira execução pode levar 3–5 minutos (download de imagens + build).

### 4. Acessar a aplicação

| Serviço        | URL                                                          |
|----------------|--------------------------------------------------------------|
| Frontend       | [http://localhost](http://localhost)                         |
| API (Swagger)  | [http://localhost:8000/docs](http://localhost:8000/docs)     |
| API (ReDoc)    | [http://localhost:8000/redoc](http://localhost:8000/redoc)   |

---

## Dados Iniciais (Seed)

O banco é populado automaticamente ao subir pela primeira vez com dados de exemplo.

**Usuários disponíveis:**

| Username   | Senha       | Perfil        |
|------------|-------------|---------------|
| admin      | Admin@123   | Administrador |
| avaliador  | Avalia@123  | Avaliador     |

**Produtos pré-cadastrados:** 15 serviços agrícolas com movimentações de caixa e estoques já calculados, com datas distribuídas ao longo do ano corrente.

Para resetar os dados e rodar o seed novamente:

```bash
docker compose down -v
docker compose up --build
```

---

## Rodar em Segundo Plano

```bash
docker compose up --build -d
```

Acompanhar logs:

```bash
docker compose logs -f backend
docker compose logs -f frontend
```

---

## Parar os Containers

```bash
# Para os containers (dados preservados)
docker compose down

# Para os containers e apaga o banco de dados
docker compose down -v
```

---

## Desenvolvimento Local (sem Docker)

### Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

> Crie um `frontend/.env.local` com `VITE_API_URL=http://localhost:8000` para rodar localmente sem Docker.

---

## Endpoints Principais

> Todas as rotas (exceto `/login` e `/register`) exigem autenticação via JWT.  
> No Swagger, clique em **Authorize 🔒** e insira o `access_token` retornado no login.

### Autenticação

| Método | Rota        | Descrição                  |
|--------|-------------|----------------------------|
| POST   | /register   | Criar usuário              |
| POST   | /login      | Login (retorna JWT)        |
| POST   | /logout     | Logout                     |
| GET    | /me         | Dados do usuário logado    |

### Produtos

| Método | Rota             | Descrição              |
|--------|------------------|------------------------|
| GET    | /produtos        | Listar com paginação e filtros |
| POST   | /produtos        | Criar produto          |
| GET    | /produtos/{id}   | Buscar por ID          |
| PATCH   | /produtos/{id}   | Atualizar produto      |
| DELETE | /produtos/{id}   | Remover produto        |

### Fluxo de Caixa

| Método | Rota                    | Descrição                      |
|--------|-------------------------|--------------------------------|
| POST   | /caixa/movimentacoes    | Registrar entrada ou saída     |
| GET    | /caixa/movimentacoes    | Listar com filtros e totais    |
| GET    | /caixa/resumo           | Resumo financeiro geral        |

### GIS

| Método | Rota                       | Descrição                        |
|--------|----------------------------|----------------------------------|
| GET    | /gis/usos-solo             | Listar usos do solo disponíveis  |
| POST   | /gis/pontos-amostragem     | Criar ponto de amostragem        |
| GET    | /gis/pontos-amostragem     | Listar pontos cadastrados        |

---

## Variáveis de Ambiente

| Variável                       | Descrição                    | Padrão                                           |
|--------------------------------|------------------------------|--------------------------------------------------|
| DB_HOST                        | Host do PostgreSQL           | db                                               |
| DB_PORT                        | Porta do PostgreSQL          | 5432                                             |
| DB_NAME                        | Nome do banco                | sigma_db                                         |
| DB_USER                        | Usuário do banco             | sigma_user                                       |
| DB_PASSWORD                    | Senha do banco               | gerada pelo setup.py                             |
| APP_ENV                        | Ambiente da aplicação        | development                                      |
| APP_HOST                       | Host do servidor             | 0.0.0.0                                          |
| APP_PORT                       | Porta do servidor            | 8000                                             |
| SECRET_KEY                     | Chave JWT                    | gerada pelo setup.py                             |
| ALGORITHM                      | Algoritmo JWT                | HS256                                            |
| ACCESS_TOKEN_EXPIRE_MINUTES    | Expiração do token           | 30                                               |
| ENABLE_AUTH                    | Ativar autenticação          | True                                             |
| CORS_ORIGINS                   | Origens permitidas           | `["http://localhost","http://localhost:5173"]`   |
| GEOJSON_PATH                   | Caminho do GeoJSON           | data/uso_ocupacao_teste.geojson                  |
| VITE_API_URL                   | URL da API no frontend       | http://localhost:8000                            |

---

## Regras de Senha

Ao criar um usuário, a senha deve conter:

- Mínimo 8 caracteres
- Ao menos 1 letra maiúscula
- Ao menos 1 letra minúscula
- Ao menos 1 número
- Ao menos 1 caractere especial (`!@#$%^&*`)

---

## Comandos Úteis

```bash

# Rodar migrations manualmente
docker exec sigma-backend alembic upgrade head

# Reconstruir apenas o backend
docker compose up --build backend
```




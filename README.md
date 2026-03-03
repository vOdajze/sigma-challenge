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

### 4. Acessar a aplicação

| Serviço       | URL                                                        |
|---------------|------------------------------------------------------------|
| Frontend      | [http://localhost](http://localhost)                       |
| API (Swagger) | [http://localhost:8000/docs](http://localhost:8000/docs)   |
| API (ReDoc)   | [http://localhost:8000/redoc](http://localhost:8000/redoc) |

---

## Dados Iniciais (Seed)

O banco é populado automaticamente ao subir pela primeira vez com dados de exemplo.

**Usuários disponíveis:**

| Username  | Senha      | Perfil        |
|-----------|------------|---------------|
| admin     | Admin@123  | Administrador |
| avaliador | Avalia@123 | Avaliador     |

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
> No Swagger, clique em **Authorize** e insira o `access_token` retornado no login.

### Autenticação

| Método | Rota      | Descrição               |
|--------|-----------|-------------------------|
| POST   | /register | Criar usuário           |
| POST   | /login    | Login (retorna JWT)     |
| POST   | /logout   | Logout                  |
| GET    | /me       | Dados do usuário logado |

### Produtos

| Método | Rota           | Descrição                      |
|--------|----------------|--------------------------------|
| GET    | /produtos      | Listar com paginação e filtros |
| POST   | /produtos      | Criar produto                  |
| GET    | /produtos/{id} | Buscar por ID                  |
| PATCH  | /produtos/{id} | Atualizar produto              |
| DELETE | /produtos/{id} | Remover produto                |

### Fluxo de Caixa

| Método | Rota                 | Descrição                              |
|--------|----------------------|----------------------------------------|
| POST   | /caixa/movimentacao  | Registrar entrada ou saída             |
| GET    | /caixa/movimentacoes | Listar movimentações com totais e saldo |

### GIS

| Método | Rota                   | Descrição                       |
|--------|------------------------|---------------------------------|
| GET    | /gis/usos-solo         | Listar usos do solo disponíveis |
| GET    | /gis/usos-solo/{uso}   | Buscar área de um uso do solo   |
| POST   | /gis/pontos            | Criar ponto georreferenciado    |
| GET    | /gis/pontos            | Listar pontos cadastrados       |

---

## Testes com Postman

Os arquivos da collection e do environment estão disponíveis na pasta `/postman` do repositório:

```
postman/
├── postman_collection.json
└── postman_environment.json
```

### Como importar

1. Abra o Postman
2. Clique em **File → Import**
3. Arraste os dois arquivos da pasta `/postman` de uma vez
4. No canto superior direito, selecione o environment **"Sigma Challenge"** no dropdown

### Sequência sugerida de execução

| Ordem | Método | Endpoint                  | Descrição                                    |
|-------|--------|---------------------------|----------------------------------------------|
| 1     | POST   | /login                    | Obtém e salva `{{token}}` automaticamente    |
| 2     | POST   | /produtos                 | Cria produto e salva `{{produto_id}}`        |
| 3     | GET    | /produtos                 | Lista todos os produtos                      |
| 4     | GET    | /produtos/{{produto_id}}  | Busca o produto criado                       |
| 5     | PATCH  | /produtos/{{produto_id}}  | Atualiza o produto                           |
| 6     | POST   | /caixa/movimentacao       | Registra movimentação de entrada             |
| 7     | GET    | /caixa/movimentacoes      | Lista movimentações com totais e saldo       |
| 8     | GET    | /gis/usos-solo            | Lista usos do solo disponíveis               |
| 9     | GET    | /gis/usos-solo/PRÓPRIAS   | Busca área de um uso específico              |
| 10    | POST   | /gis/pontos               | Cria ponto georreferenciado                  |
| 11    | GET    | /gis/pontos               | Lista pontos cadastrados                     |
| 12    | DELETE | /produtos/{{produto_id}}  | Remove o produto de teste                    |
*Obs: Caso o produto tenha movimentções, não será permitido o delete.
> As variáveis `{{token}}` e `{{produto_id}}` são preenchidas automaticamente pelos scripts da collection — nenhuma configuração manual é necessária.


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





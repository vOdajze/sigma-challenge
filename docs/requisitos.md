<div align="center">

## Especificação de Requisitos de Software — Desafio Sigma

**Versão:** 1.2 · **Data:** 28 de fevereiro de 2026 · **Status:** Ativo

</div>

---

### 1. Introdução

Este documento registra os requisitos de software do **Desafio Sigma**, uma aplicação full-stack que integra gerenciamento de produtos, controle de fluxo de caixa, infraestrutura containerizada e análise geoespacial (GIS).

O projeto está estruturado em quatro partes complementares: (1) Arquitetura Back-End com Python, (2) Infraestrutura com Docker, (3) Funcionalidades GIS com dados georreferenciados e (4) Testes e documentação com Postman. Os requisitos estão descritos no formato de estórias de usuário, organizadas por módulo funcional, e seguem a estrutura:

> Como `<papel de usuário>` eu quero `<descrição da necessidade>` a fim de `<objetivo do usuário>`.

Cada estória possui condições de satisfação objetivas e verificáveis, que definem os critérios mínimos para que a funcionalidade seja considerada completamente implementada.

---

### 2. Classes de Usuários

O sistema contempla três classes de usuários com perfis e responsabilidades distintas:

**Usuário da API**
Desenvolvedor ou sistema externo que consome diretamente os endpoints REST da aplicação. Possui conhecimento técnico para formular requisições HTTP, interpretar responses JSON e lidar com códigos de status. Não há restrições de acesso por padrão — caso JWT seja implementado, passa a depender de autenticação prévia para acessar rotas protegidas.

**Usuário da Interface**
Usuário final que interage com a aplicação por meio do frontend web (React). Não precisa conhecer os detalhes da API subjacente. Realiza operações como cadastrar produtos, registrar movimentações de caixa e explorar dados geoespaciais por meio de formulários e mapas interativos.


---

### 3. Definição de Conceitos

Nesta seção são descritos os principais conceitos do domínio do sistema.

**Produto** — Entidade central do sistema, composta por nome, descrição e preço. Representa um item gerenciável no inventário da aplicação.

**Fluxo de Caixa** — Registro de movimentações financeiras associadas a produtos, com controle de entradas e saídas de estoque e valores. Permite calcular o saldo consolidado do sistema.

**Movimentação** — Evento de entrada ou saída de um produto no fluxo de caixa. Contém quantidade, valor unitário, valor total calculado e tipo (`entrada` ou `saida`).

**GeoJSON** — Formato de arquivo baseado em JSON para representação de geometrias geográficas (polígonos, pontos, linhas). Neste projeto, contém as geometrias de uso do solo com a propriedade `desc_uso_solo`.

**Uso do Solo** — Classificação geoespacial de uma área geográfica, representada pela propriedade `desc_uso_solo` nas features do GeoJSON fornecido.

**Ponto Georreferenciado** — Registro composto por latitude, longitude e uso do solo associado. O sistema identifica automaticamente o uso do solo com base na geometria que contém o ponto.

**JWT (JSON Web Token)** — Padrão de autenticação stateless baseado em tokens assinados. Utilizado para proteger rotas da API sem necessidade de sessões no servidor.

**Docker / Docker Compose** — Ferramentas de containerização e orquestração. Permitem empacotar e executar os serviços da aplicação (backend, frontend, banco de dados) de forma isolada e reproduzível em qualquer ambiente.

**CRUD** — Conjunto de quatro operações básicas sobre dados: Create (criar), Read (ler), Update (atualizar) e Delete (deletar).

---

### 4. Requisitos de Software

#### 4.1. Requisitos Funcionais

Os requisitos funcionais estão descritos no formato de estórias de usuário, organizadas por módulo. As prioridades seguem a tabela abaixo:

| Prioridade | Descrição |
|---|---|
| 🔴 Alta | Obrigatório para entrega |
| 🟡 Média | Importante, mas não bloqueia |
| 🟢 Baixa | Diferencial avaliativo |

Uma estória é considerada completamente implementada se e somente se:

- A funcionalidade está completamente codificada e os critérios de satisfação foram cumpridos;
- Os endpoints foram validados com testes na Collection Postman;
- O código está versionado no repositório Git com commits semânticos;
- O `README.md` foi atualizado caso a estória impacte a execução do projeto.

---

##### Módulo 1 — CRUD de Produtos

---

**SIGMA-001** · 🔴 Alta

Como **usuário da API** eu quero **cadastrar um novo produto** a fim de **registrar itens disponíveis no sistema com nome, descrição e valor**.

**Condições de satisfação:**
- `POST /produtos` aceita body JSON com `nome` (string, obrigatório), `descricao` (string, obrigatório) e `preco` (decimal, obrigatório);
- Retorna o produto criado com `id` gerado e status HTTP `201 Created`;
- Campos obrigatórios ausentes retornam status `422` com mensagem descritiva de erro;
- O produto é persistido corretamente na tabela `produtos` do PostgreSQL.

---

**SIGMA-002** · 🔴 Alta

Como **usuário da API** eu quero **listar todos os produtos cadastrados** a fim de **visualizar o inventário completo do sistema**.

**Condições de satisfação:**
- `GET /produtos` retorna array JSON com todos os produtos cadastrados;
- Cada item contém `id`, `nome`, `descricao`, `preco`, `created_at` e `updated_at`;
- Retorna array vazio `[]` caso não haja produtos, com status `200 OK`;
- Tempo de resposta inferior a 500ms.

---

**SIGMA-003** · 🔴 Alta

Como **usuário da API** eu quero **buscar um produto específico pelo seu ID** a fim de **visualizar os detalhes de um item em particular**.

**Condições de satisfação:**
- `GET /produtos/{id}` retorna o produto correspondente com status `200 OK`;
- Produto inexistente retorna status `404 Not Found` com mensagem clara;
- O `id` deve ser o identificador único gerado no cadastro (SIGMA-001).

---

**SIGMA-004** · 🔴 Alta

Como **usuário da API** eu quero **atualizar os dados de um produto existente** a fim de **manter as informações do inventário sempre corretas**.

**Condições de satisfação:**
- `PUT /produtos/{id}` aceita body JSON com os campos a serem atualizados;
- Retorna o produto atualizado com status `200 OK`;
- O campo `updated_at` é atualizado automaticamente;
- Produto inexistente retorna status `404 Not Found`.

---

**SIGMA-005** · 🔴 Alta

Como **usuário da API** eu quero **remover um produto do sistema** a fim de **manter o inventário sem itens obsoletos ou incorretos**.

**Condições de satisfação:**
- `DELETE /produtos/{id}` remove o produto e retorna status `204 No Content`;
- Produto inexistente retorna status `404 Not Found`;
- Ao deletar um produto, suas movimentações de caixa relacionadas devem ser tratadas (cascade ou bloqueio, definir na implementação).

---

##### Módulo 2 — Fluxo de Caixa

---

**SIGMA-006** · 🔴 Alta

Como **usuário da API** eu quero **registrar a entrada ou saída de um produto no fluxo de caixa** a fim de **controlar a movimentação de estoque e valores financeiros**.

**Condições de satisfação:**
- `POST /caixa/movimentacao` aceita `produto_id`, `quantidade` (integer), `valor_unitario` (decimal) e `tipo_movimentacao` (`"entrada"` ou `"saida"`);
- Campo `valor_total` é calculado automaticamente (`quantidade × valor_unitario`);
- `produto_id` inválido retorna status `404 Not Found`;
- `tipo_movimentacao` fora dos valores aceitos retorna status `422`;
- Retorna a movimentação criada com status `201 Created`.

---

**SIGMA-007** · 🔴 Alta

Como **usuário da API** eu quero **visualizar o resumo do fluxo de caixa** a fim de **acompanhar o saldo consolidado de entradas e saídas**.

**Condições de satisfação:**
- `GET /caixa` retorna resumo com total de entradas, total de saídas e saldo atual;
- Lista as movimentações registradas com `produto_id`, `quantidade`, `valor_total`, `tipo_movimentacao` e `data_movimentacao`;
- Retorna status `200 OK` mesmo que não haja movimentações (saldo zerado).

---

##### Módulo 3 — Autenticação JWT (Diferencial)

---

**SIGMA-008** · 🟢 Baixa (Diferencial)

Como **usuário do sistema** eu quero **autenticar-me com usuário e senha** a fim de **obter acesso seguro às funcionalidades protegidas da aplicação**.

**Condições de satisfação:**
- `POST /login` aceita `username` e `password` no body;
- Credenciais válidas retornam token JWT com informações de expiração e status `200 OK`;
- Credenciais inválidas retornam status `401 Unauthorized`;
- Token JWT deve ser enviado no header `Authorization: Bearer <token>` nas requisições subsequentes;
- Rotas protegidas retornam `401` para requisições sem token ou com token expirado;
- Token possui tempo de expiração configurável via variável de ambiente.

---

##### Módulo 4 — GIS: Usos do Solo

---

**SIGMA-009** · 🔴 Alta

Como **usuário da API** eu quero **visualizar a lista de todos os tipos de uso do solo disponíveis** a fim de **conhecer as categorias geoespaciais presentes no dataset**.

**Condições de satisfação:**
- `GET /gis/usos-solo` retorna lista de valores únicos da propriedade `desc_uso_solo` do GeoJSON;
- Retorna array de strings com status `200 OK`;
- Dados são derivados do arquivo GeoJSON fornecido pelo desafio;
- Não há duplicatas na lista retornada.

---

**SIGMA-010** · 🔴 Alta

Como **usuário da API** eu quero **buscar a área total de um tipo de uso do solo específico** a fim de **obter a dimensão geográfica de cada categoria do dataset**.

**Condições de satisfação:**
- `GET /gis/usos-solo/{uso}` retorna a área total das geometrias correspondentes ao tipo informado;
- Área retornada em m² ou km², com indicação da unidade no response JSON;
- Tipo de uso inexistente retorna status `404 Not Found`;
- Cálculo realizado via biblioteca geoespacial (GeoPandas ou Shapely);
- Valor de área com precisão adequada (mínimo 2 casas decimais).

---

##### Módulo 5 — GIS: Pontos Georreferenciados

---

**SIGMA-011** · 🔴 Alta

Como **usuário da API** eu quero **salvar um ponto georreferenciado com latitude e longitude** a fim de **registrar localidades com seu respectivo uso do solo identificado automaticamente**.

**Condições de satisfação:**
- `POST /gis/pontos` aceita `latitude` (float) e `longitude` (float);
- O sistema identifica automaticamente o `desc_uso_solo` com base nas coordenadas e nas geometrias do GeoJSON (ponto dentro do polígono);
- Retorna o ponto criado com `id`, `latitude`, `longitude`, `desc_uso_solo` e status `201 Created`;
- Coordenadas fora de qualquer geometria retornam status `422` com mensagem informativa;
- Ponto persistido na tabela `pontos_amostragem` com UUID como identificador.

---

**SIGMA-012** · 🔴 Alta

Como **usuário da API** eu quero **listar todos os pontos georreferenciados cadastrados** a fim de **visualizar o histórico de amostragens realizadas no sistema**.

**Condições de satisfação:**
- `GET /gis/pontos` retorna array com todos os pontos salvos;
- Cada item contém `id`, `latitude`, `longitude`, `desc_uso_solo` e `created_at`;
- Retorna array vazio com status `200 OK` caso não haja pontos cadastrados.

---

##### Módulo 6 — Infraestrutura

---

**SIGMA-013** · 🔴 Alta · **[EPIC]**

Como **desenvolvedor** eu quero **executar toda a aplicação com um único comando Docker** a fim de **garantir que qualquer pessoa consiga replicar o ambiente sem configurações manuais**.

Sub-estórias: SIGMA-013a, SIGMA-013b, SIGMA-013c, SIGMA-013d

---

**SIGMA-013a** · 🔴 Alta

Como **desenvolvedor** eu quero **containerizar o Back-End com Docker** a fim de **isolar o ambiente de execução da API Python e garantir consistência entre ambientes**.

**Condições de satisfação:**
- `Dockerfile` na pasta `/backend` instala dependências via `requirements.txt` e inicia o servidor;
- Container expõe porta `8000`;
- Variáveis de ambiente configuráveis via `.env`.

---

**SIGMA-013b** · 🔴 Alta

Como **desenvolvedor** eu quero **containerizar o banco de dados PostgreSQL** a fim de **garantir persistência de dados em ambiente isolado e reproduzível**.

**Condições de satisfação:**
- Serviço `db` no `docker-compose.yml` usa imagem oficial `postgres:15`;
- Volume persistente configurado para não perder dados ao reiniciar o container;
- Variáveis `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` configuráveis via `.env`.

---

**SIGMA-013c** · 🔴 Alta

Como **desenvolvedor** eu quero **containerizar o Frontend com Docker** a fim de **garantir que a interface web seja servida em ambiente isolado e reproduzível**.

**Condições de satisfação:**
- `Dockerfile` na pasta `/frontend` instala dependências via `package.json` e realiza o build da aplicação;
- Imagem de produção utiliza servidor estático (`nginx`) para servir os arquivos gerados pelo build;
- Container expõe porta `80` (ou `3000` em modo desenvolvimento);
- Variável de ambiente `VITE_API_URL` configurável via `.env` para apontar para o Back-End;
- Arquivo `.env.example` documentado com todas as variáveis necessárias.

---

**SIGMA-013d** · 🔴 Alta

Como **desenvolvedor** eu quero **orquestrar todos os servidores com Docker Compose** a fim de **subir o ambiente completo com um único comando (`docker-compose up --build`)**.

**Condições de satisfação:**
- `docker-compose.yml` define os serviços `backend`, `db` e `frontend`;
- Serviços têm dependências configuradas (`depends_on`);
- Healthchecks configurados para o banco de dados;
- Containers reiniciam automaticamente em caso de falha (`restart: unless-stopped`);
- Redes internas configuradas entre os containers.

---

##### Módulo 7 — Frontend Web

Stack: **React + TypeScript + Vite + react-leaflet**

---

**SIGMA-015** · 🔴 Alta · **[EPIC]**

Como **usuário da interface** eu quero **acessar uma aplicação web integrada** a fim de **interagir com todas as funcionalidades do sistema de forma visual e intuitiva**.

Sub-estórias: SIGMA-015a, SIGMA-015b, SIGMA-015c, SIGMA-015d, SIGMA-015e

---

**SIGMA-015a** · 🔴 Alta

Como **usuário da interface** eu quero **gerenciar produtos por meio de uma tela dedicada** a fim de **manter o inventário atualizado de forma ágil e com feedback visual imediato**.

**Condições de satisfação:**
- Tela lista todos os produtos em formato de tabela ou cards com `nome`, `descricao` e `preco`;
- Formulário de cadastro com validação dos campos obrigatórios antes de enviar à API;
- Ação de edição abre formulário preenchido com os dados atuais do produto;
- Ação de exclusão exibe confirmação antes de deletar;
- Feedback visual (loading, sucesso, erro) para todas as operações.

---

**SIGMA-015b** · 🔴 Alta

Como **usuário da interface** eu quero **visualizar e registrar movimentações no fluxo de caixa** a fim de **acompanhar a saúde financeira do inventário em tempo real**.

**Condições de satisfação:**
- Tela exibe o resumo do caixa com total de entradas, saídas e saldo atual;
- Formulário permite registrar nova movimentação selecionando produto (via dropdown), quantidade, valor unitário e tipo (`entrada` / `saida`);
- Lista de movimentações exibida em ordem cronológica decrescente;
- Valor total calculado automaticamente no frontend ao preencher quantidade e valor unitário.

---

**SIGMA-015c** · 🔴 Alta

Como **usuário da interface** eu quero **visualizar os polígonos de uso do solo em um mapa interativo** a fim de **explorar geograficamente os dados do GeoJSON de forma clara e navegável**.

**Condições de satisfação:**
- Mapa renderizado com `react-leaflet` exibindo os polígonos do GeoJSON fornecido;
- Cada polígono é colorido de acordo com seu `desc_uso_solo`;
- Ao clicar em um polígono, exibe popup com `desc_uso_solo` e área total (consumindo SIGMA-010);
- Mapa possui controles de zoom e navegação;
- Painel lateral lista todos os tipos de uso do solo disponíveis (consumindo SIGMA-009).

---

**SIGMA-015d** · 🔴 Alta

Como **usuário da interface** eu quero **registrar pontos georreferenciados clicando diretamente no mapa** a fim de **cadastrar localidades de forma rápida e precisa**.

**Condições de satisfação:**
- Ao clicar no mapa, as coordenadas (`latitude`, `longitude`) são capturadas automaticamente;
- Confirmação visual do ponto antes de salvar (marcador temporário no mapa);
- Após salvar, o ponto aparece fixado no mapa com marcador permanente;
- Popup do marcador exibe `desc_uso_solo` identificado automaticamente pela API;
- Lista de pontos cadastrados acessível na interface com opção de visualizá-los no mapa.

---

**SIGMA-015e** · 🟢 Baixa (Diferencial)

Como **usuário da interface** eu quero **autenticar-me por meio de uma tela de login** a fim de **acessar o sistema de forma segura quando a autenticação JWT estiver habilitada**.

**Condições de satisfação:**
- Tela de login com campos `username` e `password`;
- Token JWT recebido é armazenado no `localStorage` ou `sessionStorage`;
- Todas as requisições à API incluem o header `Authorization: Bearer <token>` automaticamente;
- Ao expirar o token, usuário é redirecionado para a tela de login;
- Rota de logout limpa o token armazenado.

---

##### Módulo 8 — Testes e Documentação com Postman (Diferencial)

---

**SIGMA-014** · 🟢 Baixa (Diferencial)

Como **avaliador técnico** eu quero **importar uma Collection Postman completa** a fim de **validar todos os endpoints da API de forma organizada e sem configuração manual**.

**Condições de satisfação:**
- Arquivo `postman_collection.json` exportado e salvo na pasta `/postman` do repositório;
- Collection cobre todos os endpoints dos Módulos 1 ao 5;
- Variáveis globais configuradas: `{{base_url}}`, `{{token}}` e `{{produto_id}}`;
- Script de autenticação salva token automaticamente no ambiente após `POST /login`;
- `postman_environment.json` incluído (opcional);
- `README.md` contém instruções de importação e a sequência de execução abaixo.

**Sequência de execução sugerida:**

| Ordem | Endpoint | Descrição |
|---|---|---|
| 1 | `POST /login` | Obter e salvar token JWT |
| 2 | `POST /produtos` | Criar produto de teste |
| 3 | `GET /produtos` | Listar todos os produtos |
| 4 | `GET /produtos/{id}` | Buscar produto criado |
| 5 | `POST /caixa/movimentacao` | Registrar movimento de entrada |
| 6 | `GET /caixa` | Visualizar resumo do caixa |
| 7 | `PUT /produtos/{id}` | Atualizar produto |
| 8 | `GET /gis/usos-solo` | Listar usos do solo |
| 9 | `GET /gis/usos-solo/{uso}` | Buscar área de um uso |
| 10 | `POST /gis/pontos` | Criar ponto georreferenciado |
| 11 | `GET /gis/pontos` | Listar pontos |
| 12 | `DELETE /produtos/{id}` | Deletar produto de teste |

---

#### 4.2. Requisitos Não-Funcionais

**RNF-001 — Tempo de resposta**
O sistema deve responder a requisições de leitura simples (listagens e buscas por ID) em tempo inferior a 500ms em condições normais de operação.

**RNF-002 — Persistência de dados**
O sistema deve garantir que nenhum dado seja perdido em caso de reinicialização dos containers, utilizando volumes Docker persistentes para o banco de dados PostgreSQL.

**RNF-003 — Reprodutibilidade de ambiente**
O sistema deve poder ser iniciado completamente em qualquer máquina com Docker e Docker Compose instalados, executando apenas o comando `docker-compose up --build`, sem configurações manuais adicionais além das variáveis de ambiente documentadas no `.env.example`.

**RNF-004 — Segurança de entrada**
O sistema deve validar e sanitizar todas as entradas de usuário em todos os endpoints, retornando mensagens de erro descritivas e status HTTP adequados para entradas inválidas.

**RNF-005 — Segurança de autenticação**
O sistema deve armazenar senhas de usuários utilizando algoritmo de hash seguro (bcrypt ou equivalente) e nunca expor senhas em plaintext em responses ou logs.

**RNF-006 — Resiliência**
O sistema deve reiniciar automaticamente os containers em caso de falha, e o serviço de backend deve aguardar a disponibilidade do banco de dados antes de inicializar (healthcheck + retry).

**RNF-007 — Integração frontend-backend**
O sistema deve permitir que o frontend consuma a API sem erros de CORS, com a configuração de headers adequada no backend para o domínio do servidor frontend.

**RNF-008 — Rastreabilidade de dados GIS**
O sistema deve calcular a área de uso do solo utilizando projeção geográfica adequada (coordenadas métricas), garantindo precisão mínima de 2 casas decimais no resultado.

**RNF-009 — Versionamento**
O código-fonte do sistema deve ser versionado em repositório Git público, com histórico de commits semânticos que reflitam a evolução do desenvolvimento.

**RNF-010 — Documentação**
O sistema deve conter um `README.md` na raiz do repositório com instruções completas para instalação, configuração de variáveis de ambiente e inicialização em modo desenvolvimento.

---

### 5. Rastreabilidade de Requisitos

A tabela abaixo registra todos os requisitos funcionais do sistema com seus identificadores, módulos e prioridades, servindo como referência para rastreabilidade entre estórias, implementação e testes.

| ID | Estória | Módulo | Prioridade |
|---|---|---|---|
| SIGMA-001 | Cadastrar produto | CRUD Produtos | 🔴 Alta |
| SIGMA-002 | Listar produtos | CRUD Produtos | 🔴 Alta |
| SIGMA-003 | Buscar produto por ID | CRUD Produtos | 🔴 Alta |
| SIGMA-004 | Atualizar produto | CRUD Produtos | 🔴 Alta |
| SIGMA-005 | Remover produto | CRUD Produtos | 🔴 Alta |
| SIGMA-006 | Registrar movimentação de caixa | Fluxo de Caixa | 🔴 Alta |
| SIGMA-007 | Visualizar resumo do caixa | Fluxo de Caixa | 🔴 Alta |
| SIGMA-008 | Autenticação JWT | Autenticação | 🟢 Baixa |
| SIGMA-009 | Listar usos do solo | GIS | 🔴 Alta |
| SIGMA-010 | Buscar área por uso do solo | GIS | 🔴 Alta |
| SIGMA-011 | Salvar ponto georreferenciado | GIS Pontos | 🔴 Alta |
| SIGMA-012 | Listar pontos georreferenciados | GIS Pontos | 🔴 Alta |
| SIGMA-013a | Dockerfile — Back-End | Infraestrutura | 🔴 Alta |
| SIGMA-013b | Dockerfile — Banco de Dados | Infraestrutura | 🔴 Alta |
| SIGMA-013c | Dockerfile — Frontend | Infraestrutura | 🔴 Alta |
| SIGMA-013d | Docker Compose | Infraestrutura | 🔴 Alta |
| SIGMA-015a | Tela de gerenciamento de produtos | Frontend | 🔴 Alta |
| SIGMA-015b | Tela de fluxo de caixa | Frontend | 🔴 Alta |
| SIGMA-015c | Mapa interativo com polígonos GIS | Frontend | 🔴 Alta |
| SIGMA-015d | Registro de pontos via clique no mapa | Frontend | 🔴 Alta |
| SIGMA-015e | Tela de login com JWT | Frontend | 🟢 Baixa |
| SIGMA-014 | Collection Postman | Testes | 🟢 Baixa |
| RNF-001 | Tempo de resposta < 500ms | Não-Funcional | 🔴 Alta |
| RNF-002 | Persistência com volumes Docker | Não-Funcional | 🔴 Alta |
| RNF-003 | Reprodutibilidade de ambiente | Não-Funcional | 🔴 Alta |
| RNF-004 | Validação de entradas | Não-Funcional | 🔴 Alta |
| RNF-005 | Hash de senhas | Não-Funcional | 🟡 Média |
| RNF-006 | Resiliência dos containers | Não-Funcional | 🔴 Alta |
| RNF-007 | Configuração de CORS | Não-Funcional | 🔴 Alta |
| RNF-008 | Precisão de cálculo GIS | Não-Funcional | 🔴 Alta |
| RNF-009 | Versionamento Git | Não-Funcional | 🔴 Alta |
| RNF-010 | Documentação README | Não-Funcional | 🔴 Alta |

---

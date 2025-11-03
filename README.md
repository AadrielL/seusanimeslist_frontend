# 🍜 AnimeList App

[![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue.svg)](LICENSE.md)
[![Tecnologias](https://img.shields.io/badge/Stack-React%20%7C%20Spring%20%7C%20PostgreSQL-34495e.svg)](http://link-para-o-projeto)
[![Status do Deploy no Render](https://img.shields.io/badge/Deploy-Render-success.svg)]([Link do deploy no Render])

## 📖 Sobre o Projeto

O **AnimeList App** é uma plataforma full-stack dedicada ao gerenciamento e acompanhamento de animes. Os usuários podem cadastrar, buscar, avaliar e organizar suas listas de animes (Assistidos, Para Assistir, Em Progresso).

Este projeto foi desenvolvido utilizando uma arquitetura moderna para demonstrar a integração de um frontend **React** com uma API robusta **Spring Boot**, utilizando **PostgreSQL** para persistência de dados.

## ✨ Principais Funcionalidades

* **Autenticação JWT:** Login e Cadastro de usuários seguros.
* **Gerenciamento de Listas:** Adicionar, remover e mover animes entre listas personalizadas (Ex: Watching, Completed, Dropped).
* **Pesquisa:** Funcionalidade de busca rápida na base de dados.
* **Avaliações:** Sistema de notas e reviews para cada anime.
* **Deploy Fácil:** Estruturado para deploy contínuo na plataforma **Render**.

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Frontend** | **React** | Biblioteca JavaScript para a interface de usuário. |
| **Backend** | **Spring Boot** | Framework Java para construir a API Restful e lógica de negócios. |
| **Banco de Dados** | **PostgreSQL** | Banco de dados relacional robusto e escalável. |
| **Hospedagem** | **Render** | Plataforma cloud para deploy do Frontend (Web Service) e Backend (Web Service), e o banco de dados (Managed PostgreSQL). |
| **Segurança** | **Spring Security** | Implementação de autenticação JWT no backend. |

## ⚙️ Como Executar o Projeto Localmente

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:

* **Java Development Kit (JDK) 17+**
* **Node.js 18+ e npm**
* **PostgreSQL** (ou use Docker para um ambiente limpo)
* **IntelliJ IDEA** (recomendado para o backend Spring)

### 1. Backend (API Spring Boot)

1.  **Clone o Repositório:**
    ```bash
    git clone [Link do seu repositório]
    cd [nome-do-projeto]/backend
    ```
2.  **Configuração do PostgreSQL:**
    * Crie um banco de dados PostgreSQL chamado `animelist_db`.
    * Crie um arquivo `.env` (ou ajuste o `application.properties`) com suas credenciais:
        ```properties
        # Exemplo de application.properties
        spring.datasource.url=jdbc:postgresql://localhost:5432/animelist_db
        spring.datasource.username=[SEU_USUARIO_PG]
        spring.datasource.password=[SUA_SENHA_PG]
        spring.jpa.hibernate.ddl-auto=update
        # ... outras configs
        ```
3.  **Execute a Aplicação:**
    ```bash
    # Via terminal (Gradle/Maven Wrapper)
    ./mvnw spring-boot:run
    # ou execute a classe principal (main) diretamente no IntelliJ
    ```
    O backend estará rodando em `http://localhost:[PORTA_PADRAO_8080]`.

### 2. Frontend (React)

1.  **Acesse a pasta:**
    ```bash
    cd [nome-do-projeto]/frontend
    ```
2.  **Instale as dependências:**
    ```bash
    npm install
    ```
3.  **Variáveis de Ambiente:**
    * Crie um arquivo `.env` na raiz do frontend com o endereço da sua API:
        ```
        # Substitua pela porta do seu backend
        REACT_APP_API_URL=http://localhost:8080/api/v1
        ```
4.  **Inicie a Aplicação:**
    ```bash
    npm start
    ```
    O frontend estará disponível em `http://localhost:3000`.

## 🚀 Deploy (Hospedagem no Render)

O projeto está configurado para ser facilmente hospedado no **Render**.

### Backend e Banco de Dados:

1.  **Crie um Postgres Database** no Dashboard do Render.
2.  **Crie um Web Service** apontando para o seu repositório Git e configure o `build command` e `start command` do Spring Boot.
3.  **Conecte o serviço:** Use as variáveis de ambiente fornecidas pelo Render (como `DATABASE_URL`) na configuração do seu Spring Boot.

### Frontend:

1.  **Crie um Static Site** (ou Web Service) no Render.
2.  Defina o `Build Command` (`npm run build`) e o `Publish Directory` (`build`).
3.  Aponte a variável `REACT_APP_API_URL` para o endereço **público** do seu backend no Render.

## 🤝 Como Contribuir

[Mantenha esta seção como no template anterior, incentivando Pull Requests e seguindo padrões de commit.]

## ✒️ Autor

* **[Seu Nome]** - [Seu Perfil do GitHub/LinkedIn]

## 📄 Licença

Este projeto está sob a Licença MIT.
# Sistema de Atualização Cadastral

## 1. Pré-requisitos
Para rodar o projeto, é necessário ter instalado:
- Docker e Docker Compose 2.0+
- Git

## 2. Instalação e Configuração
Siga os passos abaixo para configurar o ambiente local.

### 2.1. Clone o repositório:
```bash
git clone https://github.com/thelightiz/senac-2026.git
cd atualizacao-cadastral/
```

### 2.2. Variáveis de Ambiente (.env)
1. Procure por um arquivo chamado `.env.example` na pasta raíz do projeto (novamente, não a do repositório).

2. Copie-o para `.env`:

    ```bash
    cp .env.example .env
    ```

3. Abra o .env e preencha os valores necessários.
    - Qualquer .env no repositório será ignorado pelo git por estar no .gitignore.

### 2.3. Inicialize o projeto com Docker
1. Suba os containers:
    ```bash
    docker compose up --build
    ```
2. O sistema estará disponível em:
    - Backend: http://localhost:8000
    - Frontend: http://localhost:5173

## 3. Comandos Úteis
- Acessar o terminal do Backend:
```bash
docker compose exec backend sh
```
- Ver os logs:
```bash
docker compose logs -f

# Adicione o container_name de algum container se quiser logs mais específicos
```

- Parar o projeto:
```bash
docker compose down
```

- Resetar/apagar o banco de dados:
```bash
docker compose down -v
```

## 4. Como Colaborar
### 1. Crie uma Branch
- Não faça alterações diretamente na branch main. Crie uma branch para sua funcionalidade:
```bash
git checkout -b feature/nome-da-sua-funcionalidade

# Substitua feature/ por bugfix/ se for corrigir algo, ou docs/ para atualizações de documentação.
```
### 2. Desenvolva
- Mantenha o código limpo, como descrito no README para proposta de desafio.
- Teste localmente antes de enviar.

### 3. Commit e Push
- Utilize o padrão de conventional commits, assim como também descrito no README de proposta .
- Envie **suas** alterações na **sua** branch.

### 4. Pull Request (PR)
- Abra um Pull Request na branch principal para revisão.
# Desafio Dev — Sistema de Atualização Cadastral

## 1. Contexto

Você deverá desenvolver um sistema de **atualização cadastral para uma instituição financeira**, responsável por controlar o fluxo de solicitação, avaliação e efetivação de alterações nos dados cadastrais de clientes.

O processo é dividido em **3 etapas**, envolvendo diferentes perfis de usuários:

1. **Gerente de Negócios (GN)** — solicita a atualização.
2. **Gerente de Agência (GA)** — avalia e aprova/reprova a solicitação.
3. **Time de Cadastro** — efetiva a atualização cadastral e emite um parecer.

O sistema deve garantir que **cada usuário só possa executar as ações correspondentes ao seu papel**, mantendo rastreabilidade de todo o processo.

---

# 2. Objetivo

Construir uma aplicação web que permita:

- Criar solicitações de atualização cadastral;
- Anexar documentos comprobatórios;
- Encaminhar solicitações entre as etapas;
- Aprovar, reprovar ou solicitar ajustes;
- Controlar permissões por perfil;
- Registrar histórico das ações;
- Permitir o acompanhamento do status da solicitação;
- Garantir autenticação e autorização;
- Disponibilizar observabilidade suficiente para identificar problemas no sistema.

### Tipos de atualização

O desafio contempla inicialmente apenas três tipos:

- **Renda**
- **Patrimônio**
- **Endereço**

---

# 3. Fluxo do processo

```text
┌─────────────────────┐
│ Gerente de Negócios │
│        (GN)         │
└──────────┬──────────┘
           │
           │ Cria solicitação
           │ + dados
           │ + documento
           ▼
┌─────────────────────┐
│ Gerente de Agência  │
│        (GA)         │
└──────────┬──────────┘
           │
       ┌───┼───────────────┐
       │   │               │
       ▼   ▼               ▼
    Aprova Reprova     Solicita ajuste
       │                   │
       │                   └──────► GN
       ▼
┌─────────────────────┐
│  Time de Cadastro   │
└──────────┬──────────┘
           │
       ┌───┼───────────────┐
       │   │               │
       ▼   ▼               ▼
  Atualiza  Reprova    Solicita ajuste
    dados                │
       │                 ├────► GN
       │                 │
       │                 └────► GA
       ▼
   Parecer final
```

---

# 4. Etapa 1 — Solicitação pelo Gerente de Negócios

O **Gerente de Negócios (GN)** é responsável por iniciar o processo.

### O GN deve conseguir:

- Criar uma nova solicitação;
- Informar o cliente;
- Selecionar o tipo de atualização:
  - Renda;
  - Patrimônio;
  - Endereço;
- Informar os novos dados;
- Anexar o documento que comprova a alteração;
- Consultar suas solicitações;
- Acompanhar o status;
- Corrigir solicitações devolvidas para ajuste.

### Exemplo

Para uma atualização de renda:

```text
Cliente: João da Silva
Tipo: Renda

Renda atual: R$ 4.000,00
Nova renda: R$ 6.500,00

Documento:
- contracheque.pdf
```

Após o envio, a solicitação deverá ser encaminhada para o **Gerente de Agência**.

---

# 5. Etapa 2 — Avaliação do Gerente de Agência

O **Gerente de Agência (GA)** é responsável por avaliar a solicitação antes que ela chegue ao time de Cadastro.

O GA deve conseguir visualizar:

- Dados do cliente;
- Tipo de atualização;
- Dados antigos e novos;
- Documentos anexados;
- Usuário que criou a solicitação;
- Histórico da solicitação.

### Ações disponíveis

O GA poderá:

#### Aprovar

Encaminha a solicitação para o **Time de Cadastro**.

```text
GN → GA → Cadastro
```

#### Reprovar

Encerra a solicitação como reprovada.

Deve existir uma justificativa para a reprovação.

```text
GN → GA → REPROVADO
```

#### Solicitar ajuste

Retorna a solicitação para o **Gerente de Negócios**.

Deve existir uma justificativa informando o que precisa ser corrigido.

```text
GN → GA → AJUSTE → GN
```

---

# 6. Etapa 3 — Atualização pelo Time de Cadastro

O **Time de Cadastro** é responsável pela efetivação da alteração.

Após receber uma solicitação aprovada pelo GA, o time deverá analisar novamente os dados e documentos.

### O time de Cadastro deve conseguir:

- Visualizar os dados da solicitação;
- Consultar os documentos;
- Consultar todo o histórico;
- Efetivar a alteração;
- Registrar um parecer;
- Solicitar ajustes;
- Reprovar a solicitação.

### Atualização

Quando estiver tudo correto:

```text
GA → Cadastro → Atualizado
```

O cadastro é atualizado e o processo é encerrado.

Deve ser registrado um **parecer final**.

### Solicitação de ajuste

O time de Cadastro pode identificar problemas que precisam ser corrigidos.

O ajuste poderá ser direcionado para:

- **Gerente de Negócios**
- **Gerente de Agência**

Exemplos:

```text
Cadastro → GN
```

ou

```text
Cadastro → GA
```

A justificativa do ajuste deve ser obrigatória.

---

# 7. Estados da solicitação

A aplicação deve possuir um controle claro de estados.

Uma sugestão:

```text
DRAFT
   ↓
SUBMITTED
   ↓
PENDING_AGENCY_REVIEW
   ↓
 ┌─┴───────────────┐
 │                 │
APPROVED        NEEDS_ADJUSTMENT
 │                 │
 ▼                 ▼
PENDING_        GN
CADASTRO
 │
 ├───────────────┐
 │               │
UPDATED       NEEDS_ADJUSTMENT
 │               │
 ▼               ├──► GN
COMPLETED        │
                 └──► GA

REJECTED
```

A implementação pode utilizar nomes diferentes, desde que o fluxo seja consistente.

### Regra importante

O sistema **não deve permitir transições arbitrárias de estado**.

Por exemplo:

> Um GN não deve conseguir alterar uma solicitação diretamente de `PENDING_CADASTRO` para `COMPLETED`.

As transições devem respeitar as regras de negócio e as permissões do usuário.

---

# 8. Roles e autorização

O sistema deverá implementar controle de acesso baseado em papéis (**RBAC — Role-Based Access Control**).

### Roles principais

| Role | Responsabilidade |
|---|---|
| `GN` | Criar e ajustar solicitações |
| `GA` | Avaliar solicitações e aprovar/reprovar/solicitar ajustes |
| `CADASTRO` | Efetivar atualização e emitir parecer |
| `ADMIN` | Administração técnica do sistema |

> O `ADMIN` deve ser utilizado para funções administrativas/técnicas e não deve ser tratado automaticamente como alguém autorizado a executar ações de negócio.

---

# 9. Matriz de permissões

| Ação | GN | GA | Cadastro | Admin |
|---|:---:|:---:|:---:|:---:|
| Criar solicitação | ✅ | ❌ | ❌ | ❌* |
| Anexar documento | ✅ | ❌ | ❌ | ❌* |
| Visualizar solicitação | ✅** | ✅ | ✅ | ✅ |
| Solicitar ajuste | ❌ | ✅ | ✅ | ❌* |
| Aprovar | ❌ | ✅ | ❌ | ❌ |
| Reprovar | ❌ | ✅ | ✅ | ❌ |
| Efetivar atualização | ❌ | ❌ | ✅ | ❌ |
| Emitir parecer | ❌ | ❌ | ✅ | ❌ |
| Alterar dados após aprovação | ❌ | ❌ | ✅ | ❌ |
| Consultar histórico | ✅** | ✅ | ✅ | ✅ |

\* Caso necessário, pode possuir permissões administrativas separadas, mas não deve receber permissões de negócio automaticamente.

\** Restringir conforme a regra de acesso definida para a instituição.

---

# 10. Autenticação ≠ Autorização

O desafio deve demonstrar claramente a diferença entre os dois conceitos.

### Autenticação

Responde:

> "Quem é você?"

Exemplo:

```text
POST /auth/login
```

O usuário fornece suas credenciais e recebe uma sessão/token.

### Autorização

Responde:

> "O que você pode fazer?"

Exemplo:

```text
Usuário: João
Role: GN

Pode:
✓ Criar solicitação

Não pode:
✗ Aprovar solicitação
✗ Efetivar atualização
```

**Não confie apenas no frontend para garantir permissões.**

Mesmo que um botão de "Aprovar" não apareça para um GN, a API deve rejeitar uma tentativa direta de chamada ao endpoint.

---

# 11. Segurança

A autorização deve ser implementada principalmente no **backend**.

Exemplo conceitual:

```text
POST /requests/{id}/approve

        │
        ▼
Autenticado?
        │
     ┌──┴──┐
    NÃO    SIM
    │       │
  401      ▼
        Possui role
           GA?
        │       │
       NÃO     SIM
        │       │
       403     ▼
          Executa ação
```

Além disso, considerar:

- Validação de entrada;
- Controle de acesso por objeto;
- Proteção contra acesso a solicitações de outros usuários/agências quando aplicável;
- Validação de arquivos enviados;
- Limitação de tamanho de arquivos;
- Tipos de arquivo permitidos;
- Proteção de dados sensíveis;
- Senhas armazenadas utilizando mecanismos seguros;
- Tokens/sessões com expiração adequada;
- HTTPS em ambientes reais;
- Logs sem exposição de informações sensíveis.

---

# 12. Arquitetura sugerida

A stack recomendada é:

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL

### Frontend

- React
- TypeScript
- React Router
- Biblioteca de componentes à escolha

### Infraestrutura

- Docker
- Docker Compose
- Nginx ou equivalente
- CI/CD

### Observabilidade

- Logs estruturados
- Métricas
- Health checks
- Rastreamento de erros

Uma arquitetura simples pode ser:

```text
                    ┌─────────────────┐
                    │    Browser      │
                    │     React       │
                    └────────┬────────┘
                             │
                             │ HTTPS
                             ▼
                    ┌─────────────────┐
                    │   API Django    │
                    │      + DRF      │
                    └────────┬────────┘
                             │
               ┌─────────────┼─────────────┐
               │             │             │
               ▼             ▼             ▼
          PostgreSQL      Storage       Observability
          Database        Documents      / Logs
```

---

# 13. Organização sugerida do Backend

Uma possibilidade utilizando Django:

```text
backend/
├── config/
│   ├── settings/
│   ├── urls.py
│   └── ...
│
├── users/
│   ├── models.py
│   ├── serializers.py
│   ├── permissions.py
│   └── views.py
│
├── customers/
│   ├── models.py
│   ├── serializers.py
│   └── views.py
│
├── update_requests/
│   ├── models.py
│   ├── serializers.py
│   ├── permissions.py
│   ├── services.py
│   ├── selectors.py
│   └── views.py
│
├── documents/
│   ├── models.py
│   └── services.py
│
└── audit/
    ├── models.py
    └── services.py
```

A estrutura não é obrigatória.

O objetivo é estimular **separação de responsabilidades**.

---

# 14. Clean Code

O código deve demonstrar preocupação com manutenção e legibilidade.

### Evite

```python
def update(request):
    # 200 linhas fazendo tudo
```

Uma única função não deve ser responsável por:

- Validar dados;
- Verificar autorização;
- Alterar estado;
- Salvar arquivos;
- Atualizar banco;
- Criar logs;
- Enviar notificações.

### Prefira responsabilidades bem definidas

Por exemplo:

```python
validate_update_request()
authorize_action()
approve_request()
create_audit_event()
notify_next_stage()
```

Os nomes são apenas ilustrativos.

O importante é que cada componente tenha uma responsabilidade clara.

---

# 15. Encapsulamento

As regras de negócio não devem ficar espalhadas pelo sistema.

Por exemplo, a regra:

> "Somente uma solicitação no estado `PENDING_AGENCY_REVIEW` pode ser aprovada pelo GA."

deve existir em uma camada responsável pela regra de negócio.

Evite depender de verificações espalhadas pelo frontend.

```text
Frontend
   │
   ▼
API
   │
   ▼
Authorization
   │
   ▼
Business Rules
   │
   ▼
Persistence
```

---

# 16. Histórico e Auditoria

Por se tratar de uma instituição financeira, é importante manter rastreabilidade.

Cada alteração relevante deve gerar um evento de auditoria.

Exemplo:

```json
{
  "request_id": 123,
  "user_id": 456,
  "action": "APPROVED",
  "previous_status": "PENDING_AGENCY_REVIEW",
  "new_status": "PENDING_CADASTRO",
  "timestamp": "2026-08-10T20:00:00Z"
}
```

O histórico deve permitir responder perguntas como:

- Quem criou a solicitação?
- Quem aprovou?
- Quando foi aprovada?
- Quem solicitou ajuste?
- Qual foi a justificativa?
- Quantas vezes voltou para ajuste?
- Quem efetivou a alteração?
- Qual era o estado anterior?

---

# 17. Observabilidade

O sistema deve ser observável.

Não basta apenas "funcionar".

Deve ser possível descobrir:

> O sistema está funcionando?

> Onde ocorreu o problema?

> Qual solicitação foi afetada?

> Qual usuário executou a operação?

### Logs

Registrar eventos importantes:

```text
INFO  RequestCreated
INFO  RequestApproved
INFO  RequestSentToAdjustment
INFO  CustomerDataUpdated
ERROR CustomerDataUpdateFailed
```

Os logs devem possuir informações úteis para correlação, como:

- timestamp;
- request ID;
- usuário;
- operação;
- resultado;
- correlation ID.

**Nunca registre senhas, tokens ou dados sensíveis desnecessariamente.**

### Health Check

Disponibilizar, por exemplo:

```http
GET /health
```

E, se desejado:

```http
GET /ready
```

para verificar se a aplicação está pronta para receber tráfego.

### Métricas

Algumas métricas interessantes:

```text
requests_created_total
requests_approved_total
requests_rejected_total
requests_adjustment_total
requests_completed_total
request_processing_time
```

---

# 18. API — exemplo

Uma possível API REST:

```text
POST   /api/auth/login

GET    /api/customers
GET    /api/customers/{id}

POST   /api/update-requests
GET    /api/update-requests
GET    /api/update-requests/{id}

POST   /api/update-requests/{id}/submit

POST   /api/update-requests/{id}/approve
POST   /api/update-requests/{id}/reject
POST   /api/update-requests/{id}/request-adjustment

POST   /api/update-requests/{id}/complete

GET    /api/update-requests/{id}/history
```

Os endpoints são apenas uma sugestão.

A API deve refletir as **regras de negócio**, e não apenas operações genéricas de CRUD.

---

# 19. Frontend

O frontend deve oferecer uma experiência adequada para cada perfil.

### GN

Dashboard contendo:

```text
Minhas solicitações

┌──────────┬────────────┬──────────────────┐
│ Cliente  │ Tipo       │ Status           │
├──────────┼────────────┼──────────────────┤
│ João     │ Renda      │ Em análise       │
│ Maria    │ Endereço   │ Ajuste necessário│
└──────────┴────────────┴──────────────────┘
```

### GA

Fila de solicitações aguardando avaliação.

### Cadastro

Fila de solicitações aprovadas aguardando efetivação.

Cada perfil deve visualizar as ações que fazem sentido para sua função.

**Mas lembre-se: esconder o botão não é autorização.**

A API deve continuar validando as permissões.

---

# 20. Development Life Cycle

O desafio não deve ser tratado apenas como:

> "Construir uma aplicação que funciona."

Espera-se que os participantes demonstrem um **Development Life Cycle**.

Um fluxo recomendado:

```text
         ┌──────────────┐
         │  Requisitos  │
         └──────┬───────┘
                ▼
         ┌──────────────┐
         │   Design     │
         └──────┬───────┘
                ▼
         ┌──────────────┐
         │    Backlog   │
         └──────┬───────┘
                ▼
         ┌──────────────┐
         │ Development  │
         └──────┬───────┘
                ▼
         ┌──────────────┐
         │    Tests     │
         └──────┬───────┘
                ▼
         ┌──────────────┐
         │ Code Review  │
         └──────┬───────┘
                ▼
         ┌──────────────┐
         │ CI/CD        │
         └──────┬───────┘
                ▼
         ┌──────────────┐
         │   Deploy     │
         └──────┬───────┘
                ▼
         ┌──────────────┐
         │ Observability│
         └──────┬───────┘
                │
                └──────► Feedback / evolução
```

---

# 21. Git e organização do desenvolvimento

Recomenda-se utilizar Git desde o início.

Exemplo:

```text
main
  │
  ├── feature/auth
  ├── feature/update-request
  ├── feature/agency-review
  ├── feature/cadastro
  └── feature/audit
```

Commits devem ser objetivos:

```text
feat: create customer update request
feat: add agency approval flow
feat: add cadastro completion
fix: prevent invalid status transition
test: add authorization tests
```

Pull Requests devem permitir revisão do código antes da integração.

---

# 22. Testes

Os participantes devem demonstrar testes em diferentes níveis.

### Testes unitários

Validar regras de negócio isoladamente.

Exemplo:

```text
GN não pode aprovar solicitação.
GA pode aprovar solicitação em PENDING_AGENCY_REVIEW.
Cadastro pode concluir solicitação aprovada.
Solicitação rejeitada não pode ser concluída.
```

### Testes de integração

Validar a comunicação entre:

```text
API
 ↓
Database
 ↓
Business Rules
```

### Testes de API

Validar:

```text
200 / 201 → operação permitida
400       → dados inválidos
401       → não autenticado
403       → não autorizado
404       → recurso inexistente
409       → conflito de estado
```

---

# 23. Regras importantes do desafio

A implementação deve respeitar principalmente:

### Regra 1 — Role

Um usuário só pode executar ações permitidas para sua role.

### Regra 2 — Estado

Uma ação só pode ocorrer quando a solicitação estiver em um estado compatível.

### Regra 3 — Justificativa

Reprovações e solicitações de ajuste devem possuir justificativa.

### Regra 4 — Auditoria

Ações relevantes devem ser rastreáveis.

### Regra 5 — Backend

As regras de autorização e negócio devem ser protegidas no backend.

### Regra 6 — Documentos

Documentos devem ser associados à solicitação e possuir validações adequadas.

### Regra 7 — Histórico

O histórico não deve ser simplesmente sobrescrito quando a solicitação muda de estado.

### Regra 8 — Observabilidade

Erros relevantes devem ser identificáveis através de logs/métricas.

---

# 24. O que esperamos avaliar

O objetivo não é avaliar apenas se o participante consegue construir telas.

Serão considerados aspectos como:

- Organização do código;
- Arquitetura;
- Clareza das regras de negócio;
- Clean Code;
- Encapsulamento;
- Modelagem de dados;
- API;
- Autenticação;
- Autorização;
- Segurança;
- Tratamento de erros;
- Testes;
- Auditoria;
- Observabilidade;
- Qualidade do frontend;
- Experiência do usuário;
- Organização do Git;
- Documentação;
- Processo de desenvolvimento.

---

# 25. Entrega mínima esperada

A solução deve permitir realizar o fluxo completo:

```text
GN
 │
 │ Cria solicitação
 ▼
GA
 │
 ├── Reprova ───────────────► Fim
 │
 ├── Solicita ajuste ───────► GN
 │
 └── Aprova
       │
       ▼
    Cadastro
       │
       ├── Solicita ajuste ──► GN / GA
       │
       ├── Reprova ──────────► Fim
       │
       └── Atualiza
              │
              ▼
           Parecer
              │
              ▼
            Fim
```

O participante deve conseguir demonstrar esse fluxo de ponta a ponta.

---

# 26. Diferenciais

Não são obrigatórios, mas podem agregar valor à solução:

- Docker;
- CI/CD;
- Swagger/OpenAPI;
- Testes automatizados abrangentes;
- Testes E2E;
- Métricas;
- Dashboard de observabilidade;
- Tracing distribuído;
- Sistema de notificações;
- Controle de SLA;
- Filtros e busca avançada;
- Paginação;
- Versionamento da API;
- Storage externo para documentos;
- Feature flags;
- Arquitetura preparada para novos tipos de atualização.

---

# 27. Princípio central

> **Não queremos apenas uma aplicação que funcione. Queremos uma aplicação que possa ser mantida, testada, observada e evoluída.**

Durante o desenvolvimento, pense sempre nas seguintes perguntas:

```text
Quem pode executar esta ação?

O estado atual permite esta ação?

O que acontece se a operação falhar?

Como saberemos que ela falhou?

Como rastrear quem executou a operação?

Como testar essa regra?

Como adicionar um novo tipo de atualização no futuro?

Como outro desenvolvedor entenderá esse código daqui a 6 meses?
```

O desafio deve ser tratado como um **produto de software**, e não apenas como uma implementação de CRUD.
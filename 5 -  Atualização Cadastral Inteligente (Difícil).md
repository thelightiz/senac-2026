# Desafio Dev — Atualização Cadastral Inteligente

## 1. Contexto

Uma instituição financeira deseja modernizar seu processo de **atualização cadastral**, reduzindo a necessidade de digitação manual das informações presentes nos documentos enviados pelos clientes.

Atualmente, o Gerente de Negócios (GN) precisa analisar os documentos apresentados pelo cliente e informar manualmente os dados que devem ser atualizados.

O desafio consiste em construir uma solução capaz de:

1. Receber uma solicitação de atualização cadastral;
2. Receber o documento comprobatório;
3. Identificar e extrair automaticamente as informações relevantes do documento;
4. Apresentar os dados extraídos para conferência;
5. Validar os dados conforme regras de negócio;
6. Permitir que o GN confirme ou corrija os dados extraídos;
7. Registrar a atualização;
8. Manter todo o processo auditável e observável.

A forma de extração fica a critério do participante.

Pode ser utilizado:

- OCR;
- Leitura direta de PDF;
- Bibliotecas de extração de texto;
- Modelos de IA;
- Serviços externos;
- Uma combinação das abordagens.

O participante deverá justificar sua escolha.

---

# 2. Objetivo

Construir uma aplicação web capaz de transformar:

```text
Documento
    ↓
Extração
    ↓
Dados estruturados
    ↓
Validação
    ↓
Conferência do usuário
    ↓
Atualização cadastral
```

O sistema deve contemplar inicialmente três tipos de atualização:

- **Renda**
- **Patrimônio**
- **Endereço**

O foco principal é demonstrar a capacidade de construir um sistema que lide com **dados não estruturados e transforme-os em informações confiáveis e estruturadas**.

---

# 3. Exemplo do problema

O GN deseja atualizar a renda de um cliente.

Ele não deverá necessariamente digitar:

```text
Renda:
R$ 7.350,42

Data:
07/2026

Empregador:
Empresa XYZ LTDA
```

Em vez disso, ele poderá enviar um documento:

```text
contracheque.pdf
```

O sistema deverá tentar interpretar o documento.

Por exemplo:

```text
Documento recebido
        ↓
Extração
        ↓
┌──────────────────────────┐
│ Tipo: Contracheque       │
│ Competência: 07/2026     │
│ Renda: R$ 7.350,42       │
│ Empregador: Empresa XYZ  │
│ CPF: ***.***.***-**      │
└──────────────────────────┘
        ↓
Validação
        ↓
Conferência do GN
        ↓
Atualização
```

---

# 4. Fluxo principal

A aplicação deverá possuir um fluxo semelhante a:

```text
┌──────────────────────┐
│ Gerente de Negócios  │
└──────────┬───────────┘
           │
           │ Informa cliente
           │ + tipo de atualização
           │ + documento
           ▼
┌──────────────────────┐
│ Recepção do documento│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Extração de dados    │
│ PDF / OCR / IA       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Dados estruturados   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Validação automática │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Conferência do GN    │
└──────────┬───────────┘
           │
      ┌────┴─────┐
      │          │
      ▼          ▼
   Confirmar   Corrigir
      │          │
      └────┬─────┘
           ▼
┌──────────────────────┐
│ Atualização cadastral│
└──────────┬───────────┘
           │
           ▼
       Concluído
```

Não haverá uma etapa obrigatória de aprovação manual pelo Gerente de Agência ou pelo time de Cadastro.

---

# 5. Responsabilidade do Gerente de Negócios

O GN será o principal usuário da aplicação.

### O GN deve conseguir:

- Pesquisar/selecionar um cliente;
- Selecionar o tipo de atualização;
- Fazer upload do documento;
- Acompanhar o processamento;
- Visualizar os dados extraídos;
- Visualizar o documento original;
- Conferir os dados;
- Corrigir dados extraídos incorretamente;
- Confirmar a atualização;
- Consultar o histórico das atualizações.

O GN **não deverá precisar digitar manualmente os dados existentes no documento como primeira etapa do processo**.

A extração automática deve ser o caminho principal.

---

# 6. Tipos de atualização

## 6.1 Renda

O sistema poderá extrair informações como:

```text
Nome
CPF
Competência
Valor da renda
Empregador
Data do documento
```

A implementação não precisa necessariamente extrair todos esses campos.

O participante deverá definir quais campos são relevantes e justificar sua escolha.

---

# 6.2 Patrimônio

Exemplos de informações:

```text
Tipo do bem
Descrição
Valor
Data
Proprietário
```

Exemplo:

```text
Tipo: Imóvel
Descrição: Apartamento
Valor: R$ 450.000,00
```

---

# 6.3 Endereço

Exemplos:

```text
CEP
Logradouro
Número
Complemento
Bairro
Cidade
Estado
```

O sistema poderá utilizar serviços externos para auxiliar na validação do endereço.

---

# 7. Extração de documentos

Esta é uma das principais partes do desafio.

O participante deverá desenvolver uma solução capaz de receber documentos e extrair informações relevantes.

A abordagem fica aberta.

### Opção 1 — PDF com texto

Caso o PDF contenha texto selecionável:

```text
PDF
 ↓
Text extraction
 ↓
Parser
 ↓
Structured data
```

### Opção 2 — OCR

Caso o documento seja uma imagem digitalizada:

```text
Imagem/PDF
 ↓
OCR
 ↓
Texto
 ↓
Parser
 ↓
Structured data
```

### Opção 3 — IA

O participante poderá utilizar um modelo de IA para interpretar o documento:

```text
Documento
    ↓
OCR / PDF parser
    ↓
LLM
    ↓
JSON estruturado
```

Por exemplo:

```json
{
  "document_type": "income_statement",
  "competence": "2026-07",
  "income": 7350.42,
  "employer": "Empresa XYZ LTDA"
}
```

A utilização de IA **não é obrigatória**.

O importante é que o participante demonstre uma solução tecnicamente coerente.

---

# 8. Confiança da extração

A solução deverá considerar que a extração automática pode apresentar erros.

O sistema deve, portanto, ser capaz de representar a confiança da informação extraída.

Exemplo:

```json
{
  "field": "income",
  "value": 7350.42,
  "confidence": 0.97
}
```

Uma possível interface:

```text
Dados extraídos

Renda
R$ 7.350,42                 97% ✓

Competência
07/2026                     99% ✓

Empregador
Empresa XYZ LTDA            91% ✓
```

Campos com baixa confiança podem exigir revisão manual.

---

# 9. Validação dos dados

Após a extração, o sistema deverá executar validações.

Exemplos:

### CPF

```text
CPF extraído
     ↓
Formato válido?
     ↓
Dígitos verificadores?
```

### CEP

```text
CEP
 ↓
Formato válido?
 ↓
CEP existente?
```

### Renda

```text
Renda > 0?
Valor possui formato válido?
Competência é válida?
```

### Endereço

```text
CEP
 ↓
Busca endereço
 ↓
Dados extraídos são compatíveis?
```

As regras devem ficar encapsuladas na camada de domínio/aplicação.

---

# 10. Divergência entre documento e cliente

O sistema deverá considerar situações em que o documento não corresponde ao cliente selecionado.

Exemplo:

```text
Cliente selecionado:
João da Silva

Documento:
CPF: ***.***.***-42

Cliente:
CPF: ***.***.***-87
```

O sistema deve identificar a inconsistência e impedir que a atualização seja concluída automaticamente.

Exemplo:

```text
⚠ Documento incompatível

O CPF identificado no documento
não corresponde ao cliente selecionado.
```

---

# 11. Conferência humana

A automação **não significa que todos os dados devem ser aceitos cegamente**.

Antes da atualização, o GN deverá visualizar:

```text
┌─────────────────────────────────────────┐
│ DADOS ATUAIS                            │
├─────────────────────────────────────────┤
│ Renda: R$ 4.500,00                      │
└─────────────────────────────────────────┘

                 ↓

┌─────────────────────────────────────────┐
│ DADOS EXTRAÍDOS                         │
├─────────────────────────────────────────┤
│ Renda: R$ 7.350,42                      │
│ Confiança: 97%                          │
└─────────────────────────────────────────┘

                 ↓

       [ Confirmar atualização ]
       [ Corrigir informação ]
       [ Cancelar ]
```

O GN continua sendo responsável pela confirmação final.

---

# 12. Correção manual

Caso o sistema extraia uma informação incorretamente, o usuário deverá conseguir corrigir o valor.

Exemplo:

```text
Extraído:

R$ 7.350,24

Correção:

R$ 7.350,42
```

A correção deverá ser registrada.

O sistema deve ser capaz de diferenciar:

```text
valor extraído
        ↓
valor corrigido
        ↓
valor efetivamente utilizado
```

Isso é importante para auditoria.

---

# 13. Status da solicitação

Uma sugestão de máquina de estados:

```text
CREATED
   ↓
DOCUMENT_UPLOADED
   ↓
PROCESSING
   ↓
EXTRACTED
   ↓
VALIDATING
   ↓
PENDING_REVIEW
   │
   ├───────────────┐
   │               │
   ▼               ▼
CONFIRMED       CANCELLED
   │
   ▼
UPDATING
   │
   ├──────────────┐
   │              │
   ▼              ▼
COMPLETED       FAILED
```

Caso existam erros:

```text
PROCESSING_FAILED
EXTRACTION_FAILED
VALIDATION_FAILED
```

podem ser utilizados conforme a arquitetura escolhida.

O importante é que **estados inválidos não possam ser criados arbitrariamente**.

---

# 14. Roles e autorização

Apesar de o processo possuir apenas uma etapa de negócio principal, o sistema ainda deverá possuir controle de acesso.

### Roles sugeridas

| Role | Responsabilidade |
|---|---|
| `GN` | Criar e confirmar atualizações |
| `ADMIN` | Administração técnica |
| `AUDITOR` | Consulta e auditoria |

O `ADMIN` não deve automaticamente receber permissões de negócio.

O `AUDITOR` deve possuir acesso de leitura aos registros necessários, sem poder alterar solicitações.

---

# 15. Matriz de permissões

| Ação | GN | Auditor | Admin |
|---|:---:|:---:|:---:|
| Criar solicitação | ✅ | ❌ | ❌* |
| Upload de documento | ✅ | ❌ | ❌* |
| Visualizar solicitação | ✅ | ✅ | ✅ |
| Executar extração | ✅ | ❌ | ❌* |
| Corrigir dados extraídos | ✅ | ❌ | ❌ |
| Confirmar atualização | ✅ | ❌ | ❌ |
| Cancelar solicitação | ✅ | ❌ | ❌* |
| Consultar auditoria | ❌ | ✅ | ✅ |
| Administração técnica | ❌ | ❌ | ✅ |

\* Caso existam funcionalidades administrativas específicas, elas devem possuir permissões próprias.

---

# 16. Autenticação e autorização

O backend deve ser responsável pela autorização.

Não basta esconder botões no React.

Por exemplo:

```text
POST /api/update-requests/123/confirm
```

Deve verificar:

```text
Usuário autenticado?
        ↓
Possui role GN?
        ↓
É permitido acessar esta solicitação?
        ↓
Solicitação está em PENDING_REVIEW?
        ↓
Dados foram validados?
        ↓
Executar atualização
```

Caso contrário:

```text
401 Unauthorized
```

ou:

```text
403 Forbidden
```

conforme o caso.

---

# 17. Arquitetura sugerida

A stack recomendada continua sendo:

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL

### Frontend

- React
- TypeScript

### Infraestrutura

- Docker
- Docker Compose
- CI/CD

Uma arquitetura possível:

```text
                         ┌─────────────────┐
                         │     React       │
                         │   TypeScript    │
                         └────────┬────────┘
                                  │
                                  ▼
                         ┌─────────────────┐
                         │   Django API    │
                         │      DRF        │
                         └────────┬────────┘
                                  │
             ┌────────────────────┼────────────────────┐
             │                    │                    │
             ▼                    ▼                    ▼
       PostgreSQL          Document Storage      Extraction Service
                                  │                    │
                                  │                    ├── PDF Parser
                                  │                    ├── OCR
                                  │                    └── AI/LLM
                                  │
                                  ▼
                           ┌─────────────┐
                           │ Audit/Event │
                           │    Log      │
                           └─────────────┘
```

---

# 18. Processamento assíncrono

Uma extração de documento pode demorar.

Portanto, é recomendado que o processamento seja assíncrono.

Por exemplo:

```text
POST /update-requests
        │
        ▼
Documento armazenado
        │
        ▼
Job criado
        │
        ▼
      Queue
        │
        ▼
Worker
        │
        ├── Extrai
        ├── Valida
        └── Persiste resultado
```

Tecnologias possíveis:

- Celery;
- Redis;
- RabbitMQ;
- SQS;
- outras soluções equivalentes.

Não é obrigatório utilizar uma fila, mas o participante deve considerar o impacto de processamento síncrono vs. assíncrono.

---

# 19. Idempotência

O sistema deve considerar que requisições podem ser repetidas.

Por exemplo:

```text
POST /update-requests/123/confirm
```

pode ser enviado duas vezes por:

- duplo clique;
- retry do cliente;
- problema de rede;
- timeout.

O sistema não deve realizar duas atualizações cadastrais indevidas.

O participante deverá demonstrar como sua solução trata esse cenário.

---

# 20. Concorrência

Também deve ser considerado o seguinte cenário:

```text
Usuário A ──► abre solicitação

Usuário B ──► abre a mesma solicitação

Usuário A ──► confirma

Usuário B ──► tenta confirmar novamente
```

O sistema deve possuir uma estratégia para evitar inconsistências.

Exemplos:

- Lock;
- Optimistic locking;
- Controle de versão;
- Transações;
- Constraints no banco.

A escolha fica a critério do participante.

---

# 21. Clean Code e arquitetura

O sistema deve possuir separação clara entre:

```text
HTTP
 ↓
Application
 ↓
Domain
 ↓
Infrastructure
```

Não é obrigatório utilizar Clean Architecture formalmente.

Porém, regras como:

> "Não é permitido confirmar uma solicitação sem dados válidos."

não deveriam depender diretamente de uma View do Django.

A regra deve ser testável independentemente da interface HTTP.

---

# 22. Modelo conceitual

Uma possível modelagem:

```text
User
 │
 └── Role

Customer
 │
 └── UpdateRequest
        │
        ├── UpdateType
        ├── Document
        ├── Extraction
        ├── Validation
        ├── Confirmation
        └── AuditEvents
```

Exemplo:

```text
UpdateRequest
├── id
├── customer
├── type
├── status
├── created_by
├── created_at
└── updated_at

Document
├── id
├── update_request
├── file
├── mime_type
├── checksum
└── uploaded_at

Extraction
├── id
├── document
├── extracted_data
├── confidence
├── engine
└── processed_at
```

A estrutura é apenas uma referência.

O participante poderá propor outra modelagem.

---

# 23. Versionamento dos dados extraídos

É interessante que o sistema mantenha a diferença entre:

```text
Documento original
       ↓
Extração V1
       ↓
Correção humana
       ↓
Dados finais
```

Isso permite descobrir posteriormente:

- O que o documento dizia;
- O que o sistema extraiu;
- O que o usuário alterou;
- O que foi efetivamente salvo.

---

# 24. Auditoria

Todas as operações importantes devem ser auditáveis.

Exemplo:

```json
{
  "request_id": 123,
  "user_id": 456,
  "action": "FIELD_CORRECTED",
  "field": "income",
  "extracted_value": 7350.24,
  "corrected_value": 7350.42,
  "timestamp": "2026-08-10T20:00:00Z"
}
```

Outros eventos:

```text
REQUEST_CREATED
DOCUMENT_UPLOADED
EXTRACTION_STARTED
EXTRACTION_COMPLETED
EXTRACTION_FAILED
VALIDATION_FAILED
FIELD_CORRECTED
REQUEST_CONFIRMED
CUSTOMER_DATA_UPDATED
REQUEST_CANCELLED
```

---

# 25. Observabilidade

O sistema deverá ser observável de ponta a ponta.

Um fluxo de processamento deve poder ser rastreado:

```text
Request ID: 8f72...

Upload
   ↓
Extraction
   ↓
Validation
   ↓
Confirmation
   ↓
Database Update
```

### Logs

Exemplo:

```text
INFO extraction_started
INFO extraction_completed
INFO validation_completed
INFO request_confirmed
INFO customer_updated
```

Em caso de erro:

```text
ERROR extraction_failed
ERROR customer_update_failed
```

Os logs devem possuir:

- timestamp;
- request ID;
- correlation ID;
- usuário quando aplicável;
- operação;
- duração;
- resultado.

Não registrar dados sensíveis desnecessariamente.

---

# 26. Métricas

Algumas métricas interessantes:

```text
documents_processed_total
documents_processing_failed_total

extraction_success_total
extraction_failure_total

extraction_processing_time

validation_failure_total

manual_correction_total

requests_confirmed_total
requests_cancelled_total

customer_update_success_total
customer_update_failure_total
```

Uma métrica especialmente interessante:

```text
extraction_accuracy / correction_rate
```

Por exemplo:

```text
1.000 documentos processados

820 sem correção
180 corrigidos

Taxa de correção: 18%
```

Isso permite avaliar a qualidade da solução de extração.

---

# 27. Segurança dos documentos

Documentos financeiros podem conter informações sensíveis.

A aplicação deve considerar:

- Controle de acesso;
- Validação de MIME type;
- Limite de tamanho;
- Sanitização do nome do arquivo;
- Armazenamento seguro;
- URLs protegidas;
- Expiração de URLs quando aplicável;
- Criptografia quando apropriado;
- Não exposição pública dos arquivos;
- Não registrar conteúdo sensível nos logs.

Também deve existir preocupação com arquivos maliciosos.

---

# 28. API sugerida

Uma possível API:

```text
POST   /api/auth/login

POST   /api/update-requests
GET    /api/update-requests
GET    /api/update-requests/{id}

POST   /api/update-requests/{id}/documents
GET    /api/update-requests/{id}/documents/{document_id}

POST   /api/update-requests/{id}/process

GET    /api/update-requests/{id}/extraction

POST   /api/update-requests/{id}/corrections

POST   /api/update-requests/{id}/confirm
POST   /api/update-requests/{id}/cancel

GET    /api/update-requests/{id}/history
```

A API não precisa seguir exatamente essa estrutura.

O importante é que os endpoints expressem as operações de negócio.

---

# 29. Frontend

O React deve apresentar claramente o estado do processamento.

### Upload

```text
┌────────────────────────────────────┐
│ Atualização de renda               │
│                                    │
│ [ Arraste o documento aqui ]       │
│                                    │
│ ou                                 │
│                                    │
│ [ Selecionar arquivo ]             │
└────────────────────────────────────┘
```

### Processamento

```text
Documento recebido ✓

Extraindo informações... ⏳

Validando documento... ⏳
```

### Resultado

```text
Documento analisado ✓

┌──────────────────────────────────────────┐
│ Campo          Extraído       Confiança  │
├──────────────────────────────────────────┤
│ CPF            ***.***.***-42    99%     │
│ Renda          R$ 7.350,42        97%     │
│ Competência    07/2026            99%     │
└──────────────────────────────────────────┘

[ Corrigir ]       [ Confirmar ]
```

O usuário também deve poder consultar o documento original.

---

# 30. Tratamento de erros

A aplicação deve lidar corretamente com situações como:

### Documento inválido

```text
Formato não suportado.
```

### Documento ilegível

```text
Não foi possível extrair informações
suficientes do documento.
```

### Documento incompatível

```text
O documento não pertence ao cliente selecionado.
```

### Extração indisponível

```text
Não foi possível processar o documento.
Tente novamente.
```

### Dados insuficientes

```text
Não foi possível identificar a renda
no documento apresentado.
```

O sistema não deve simplesmente retornar:

```text
500 Internal Server Error
```

para o usuário sem contexto.

---

# 31. Testes

A solução deverá possuir testes.

### Unitários

Exemplos:

```text
CPF extraído é válido.

CPF extraído é inválido.

Renda negativa é rejeitada.

Documento incompatível com cliente é rejeitado.

Solicitação sem dados obrigatórios não pode ser confirmada.
```

### Testes de integração

Validar:

```text
Upload
 ↓
Storage
 ↓
Extraction
 ↓
Validation
 ↓
Database
```

### Testes de autorização

Testar explicitamente:

```text
GN pode confirmar.
Auditor não pode confirmar.
Usuário não pode acessar solicitação indevida.
```

### Testes de concorrência/idempotência

Demonstrar o comportamento em:

```text
duplo clique
retry
duas confirmações simultâneas
```

---

# 32. Development Life Cycle

O desafio deve ser desenvolvido seguindo um processo de engenharia de software.

Não é esperado apenas:

```text
"comecei a programar e entreguei".
```

Espera-se evidência de um ciclo como:

```text
Requisitos
    ↓
Discovery
    ↓
Modelagem
    ↓
Arquitetura
    ↓
Backlog
    ↓
Desenvolvimento
    ↓
Testes
    ↓
Code Review
    ↓
CI
    ↓
Deploy
    ↓
Observabilidade
    ↓
Feedback
    ↓
Evolução
```

---

# 33. Antes de programar

O participante deve conseguir explicar:

### Qual problema está sendo resolvido?

Automatizar a transformação de documentos em dados cadastrais estruturados.

### Quais são os principais riscos?

Por exemplo:

- Extração incorreta;
- Documento ilegível;
- Documento fraudulento;
- Dados incompatíveis;
- Falha do serviço de OCR;
- Falha do modelo de IA;
- Vazamento de dados;
- Atualização duplicada.

### Quais decisões arquiteturais foram tomadas?

E principalmente:

> Por quê?

---

# 34. Git e colaboração

Utilizar Git durante todo o desenvolvimento.

Exemplo:

```text
main
 │
 ├── feature/document-upload
 ├── feature/pdf-extraction
 ├── feature/ocr
 ├── feature/validation
 ├── feature/customer-update
 └── feature/audit
```

Commits devem representar mudanças pequenas e compreensíveis:

```text
feat: add document upload
feat: extract income from pdf
feat: add document validation
feat: add customer update confirmation
test: add extraction validation tests
fix: prevent duplicate customer updates
```

Pull Requests e Code Reviews são recomendados.

---

# 35. Entregáveis

A entrega deverá conter, no mínimo:

### Código

Backend + frontend.

### README

Explicando:

- Como executar;
- Dependências;
- Variáveis de ambiente;
- Como executar testes;
- Como funciona a arquitetura.

### Arquitetura

Um diagrama simples explicando os principais componentes.

### API

Documentação dos endpoints.

Pode ser utilizada:

- OpenAPI;
- Swagger;
- outra solução equivalente.

### Testes

Com instruções para execução.

### Decisões técnicas

O participante deve explicar:

- Como funciona a extração;
- Por que escolheu OCR/PDF/IA;
- Como trata erros;
- Como trata baixa confiança;
- Como protege documentos;
- Como garante idempotência;
- Como implementa autorização.

---

# 36. Diferenciais

Não são obrigatórios, mas podem elevar a qualidade da solução.

### Extração híbrida

```text
PDF possui texto?
       │
    ┌──┴──┐
   SIM    NÃO
    │      │
Parser    OCR
    │      │
    └──┬───┘
       ▼
   Estrutura
```

### IA com saída estruturada

Utilizar um modelo para transformar texto em JSON validado por schema.

### Confidence scoring

Avaliar confiança por campo.

### Retry

Reprocessamento automático em caso de falha temporária.

### Dead Letter Queue

Isolar documentos que falharam repetidamente.

### Dashboard

Indicadores como:

```text
Documentos processados: 1.245
Taxa de sucesso: 97,2%
Taxa de correção: 12,4%
Tempo médio: 8,3s
```

### Tracing

Rastrear:

```text
Upload
 → Queue
 → OCR
 → Extraction
 → Validation
 → Update
```

---

# 37. Critérios de avaliação

A solução será avaliada não apenas pelo resultado visual.

| Critério | Peso sugerido |
|---|---:|
| Arquitetura e organização | 15% |
| Extração de documentos | 20% |
| Regras de negócio | 15% |
| Segurança e autorização | 10% |
| Testes | 10% |
| Observabilidade | 10% |
| Clean Code | 10% |
| Frontend/UX | 5% |
| Development Life Cycle | 5% |

Os pesos podem ser adaptados pela equipe responsável pelo desafio.

---

# 38. Cenário mínimo para demonstração

O participante deverá demonstrar pelo menos:

### Cenário 1 — Sucesso

```text
GN seleciona cliente
       ↓
Seleciona "Renda"
       ↓
Envia contracheque
       ↓
Sistema extrai dados
       ↓
Sistema valida
       ↓
GN confere
       ↓
GN confirma
       ↓
Cadastro atualizado
```

### Cenário 2 — Correção

```text
Documento
   ↓
Extração incorreta
   ↓
GN identifica erro
   ↓
Corrige
   ↓
Confirma
   ↓
Cadastro atualizado
```

### Cenário 3 — Documento incompatível

```text
Cliente A
   ↓
Documento do Cliente B
   ↓
Sistema identifica divergência
   ↓
Atualização bloqueada
```

### Cenário 4 — Falha na extração

```text
Documento ilegível
       ↓
Extração falha
       ↓
Solicitação fica em estado adequado
       ↓
Erro registrado
       ↓
Usuário recebe feedback
```

### Cenário 5 — Segurança

Demonstrar que:

```text
GN → pode confirmar
Auditor → não pode confirmar
Usuário sem acesso → não consegue acessar solicitação
```

---

# 39. Pergunta central do desafio

O desafio pode ser resumido em uma pergunta:

> **Como você construiria um sistema seguro e confiável capaz de transformar documentos não estruturados em atualizações cadastrais estruturadas, mantendo o usuário no controle e garantindo rastreabilidade de todo o processo?**

Não existe uma única arquitetura correta.

O objetivo é avaliar a capacidade do desenvolvedor de:

- compreender o problema;
- tomar decisões técnicas;
- justificar essas decisões;
- construir uma solução sustentável;
- lidar com falhas;
- proteger dados;
- testar o sistema;
- observar seu funcionamento;
- e evoluí-lo ao longo do tempo.

---

# 40. Princípio final

> **Automatizar não significa confiar cegamente.**

O sistema deve ser capaz de automatizar o trabalho repetitivo, mas deve reconhecer suas próprias limitações.

Uma boa solução deve responder:

```text
O que foi extraído?
        ↓
Com que confiança?
        ↓
O dado é válido?
        ↓
O documento pertence ao cliente?
        ↓
O usuário confirmou?
        ↓
O que efetivamente foi atualizado?
        ↓
Quem fez?
        ↓
Quando fez?
        ↓
Como saberemos se algo deu errado?
```

O resultado esperado não é apenas um **OCR com uma tela em volta**.

É um sistema de **engenharia de software completo**, com processamento de documentos, regras de negócio, segurança, persistência, auditoria, testes, observabilidade e um ciclo de desenvolvimento bem definido.
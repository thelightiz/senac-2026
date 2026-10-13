# SimulaCoop — Levantamento de Requisitos

Documento organizado a partir da especificação enviada.

---

## 1. Objetivo do Projeto

Desenvolver uma aplicação web que permita ao usuário simular um empréstimo ou financiamento, informando os dados da operação e recebendo, de forma clara, os resultados do cálculo financeiro (parcela, juros, CET e evolução da dívida).

A aplicação deve ter Frontend e Backend separados, comunicando-se via API.

---

## 2. Escopo

**Incluído nesta versão:**
- Simulação de empréstimo pelos sistemas de amortização Price e SAC.
- Cálculo de parcela mensal, juros compostos, CET e evolução do saldo devedor.
- Exibição de tabela de amortização completa e gráfico da evolução da dívida.

**Fora do escopo nesta versão** (mencionado no PDF como possibilidade futura, não obrigatório agora):
- Cadastro de tarifas, seguros ou impostos adicionais no cálculo do CET.
- Outros sistemas de amortização além de Price e SAC.
- Login de usuário ou histórico salvo de simulações.

---

## 3. Regras de Negócio

**Tabela Price** — parcela constante durante todo o financiamento; a composição entre juros e amortização muda a cada parcela.
```
Parcela = Valor do empréstimo × [taxa × (1 + taxa)^n] / [(1 + taxa)^n − 1]
```

**Sistema SAC** — valor de amortização constante; os juros diminuem ao longo do tempo, então a parcela também diminui.
```
Amortização = Valor do empréstimo / Número de parcelas
```
Os juros de cada parcela incidem sobre o saldo devedor antes do pagamento daquela parcela.

**CET (nesta versão)** — como não há tarifas/seguros cadastrados ainda, o CET pode considerar apenas os juros e o total desembolsado. A implementação deve permitir incluir outros custos no futuro sem reescrever a lógica.

---

## 4. Requisitos Funcionais (RF)

| ID | Descrição |
|----|-----------|
| RF01 | O sistema deve permitir que o usuário informe o valor do empréstimo (`loan_amount`). |
| RF02 | O sistema deve permitir que o usuário informe a quantidade de parcelas (`number_of_installments`). |
| RF03 | O sistema deve permitir que o usuário escolha o tipo de amortização (`amortization_type`): Price ou SAC. |
| RF04 | O sistema deve validar se o valor do empréstimo é maior que zero. |
| RF05 | O sistema deve validar se a quantidade de parcelas é um número inteiro positivo. |
| RF06 | O sistema deve validar se o tipo de amortização informado é válido (Price ou SAC). |
| RF07 | O sistema deve calcular o valor da parcela mensal pela Tabela Price. |
| RF08 | O sistema deve calcular o valor da parcela mensal pelo Sistema de Amortização Constante (SAC). |
| RF09 | O sistema deve calcular os juros compostos da operação. |
| RF10 | O sistema deve calcular o Custo Efetivo Total (CET) da operação. |
| RF11 | O sistema deve calcular a evolução do saldo devedor ao longo das parcelas. |
| RF12 | O sistema deve retornar os resultados em formato estruturado (JSON). |
| RF13 | O sistema deve exibir ao usuário: valor solicitado, quantidade de parcelas, tipo de amortização escolhido, valor da parcela mensal, total de juros pagos, total pago ao final, CET e evolução do saldo devedor. |
| RF14 | O sistema deve exibir uma tabela de amortização com: número da parcela, valor da parcela, juros, amortização e saldo devedor. |
| RF15 | O sistema deve exibir um gráfico da evolução da dívida (eixo horizontal = parcelas, eixo vertical = saldo devedor). |
| RF16 | O sistema deve tratar e informar erros: dados inválidos, campos obrigatórios ausentes, tipo de amortização inexistente, valores negativos ou zero, falhas de processamento e falhas de comunicação entre frontend e backend. |

---

## 5. Requisitos Não Funcionais (RNF)

| ID | Descrição |
|----|-----------|
| RNF01 | A arquitetura deve ser separada entre Frontend e Backend (não pode ser um monólito). |
| RNF02 | O cálculo financeiro não pode estar dentro das rotas da API; deve ficar isolado em uma camada de Services. |
| RNF03 | O Backend deve ser desenvolvido em Python, usando FastAPI ou Django. |
| RNF04 | O Frontend deve ser desenvolvido em React ou Next.js. |
| RNF05 | Os gráficos devem usar Recharts ou Chart.js. |
| RNF06 | Todo o código (variáveis, funções, classes) deve usar um único idioma — recomendado: inglês (ex: `loan_amount`, `monthly_payment`). |
| RNF07 | Não é permitido usar nomes genéricos como `x`, `y`, `a`, `b`, `valor1`. |
| RNF08 | A comunicação entre Frontend e Backend deve ser via API REST (ex: `POST /api/loans/calculate`). |
| RNF09 | Devem existir testes automatizados para os cálculos financeiros (Price, SAC, juros, saldo devedor, CET, valores inválidos). |
| RNF10 | O projeto deve usar Commits Semânticos (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`). |
| RNF11 | A interface deve ser responsiva e intuitiva, utilizável sem conhecimento técnico ou financeiro. |
| RNF12 | A arquitetura deve permitir adicionar futuramente novos tipos de amortização, taxas, tarifas e encargos sem reescrever a lógica existente. |

---

## Observação sobre o coop_plataforma

Este projeto (SimulaCoop) está sendo construído com Frontend e Backend separados, conforme RNF01. Quando for a hora de integrar ao `coop_plataforma` (projeto final que une os 5 módulos), será necessário decidir em equipe **como** essa integração vai acontecer — o layout atual do `coop_plataforma` é um monólito Flask, o que é incompatível com RNF01 e RNF04 como estão definidos aqui. Essa decisão fica para quando o time chegar nesse projeto, não bloqueia o desenvolvimento do SimulaCoop agora.

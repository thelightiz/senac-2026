# 📊 SimulaCoop: O Simulador de Crédito Transparente

**Nível:** Fácil | **Prazo:** 45 dias

## 🎯 O Desafio
As cooperativas de crédito oferecem taxas mais justas, mas muitos cooperados têm dificuldade em entender como os juros funcionam na prática. O **SimulaCoop** é uma aplicação web que calcula e demonstra, de forma visual e intuitiva, a evolução de um empréstimo.

## 🛠️ Requisitos
- **Frontend:** Interface limpa onde o usuário insere: Valor, Parcelas e Tipo de Amortização (Price ou SAC).
- **Backend:** Uma API que recebe os dados, calcula os juros compostos, o valor da parcela mensal e o Custo Efetivo Total (CET).
- **Diferencial:** Exibir um gráfico simples mostrando a evolução da dívida.

## 📚 Stack Tecnológica Sugerida
- **Backend:** Python com Django (ou FastAPI).
- **Frontend:** React ou Next.js.
- **Gráficos:** Recharts ou Chart.js.

## ✅ Boas Práticas Esperadas
1. **Clean Code:** Nomes de variáveis em inglês ou português claro (nada de `x` ou `y`, use `loan_amount` ou `valor_emprestimo`).
2. **Separação de Responsabilidades:** O cálculo financeiro não deve estar misturado com as rotas da API; crie uma camada de serviços (*Services*).
3. **Commits Semânticos:** Uso de padrões como `feat: adiciona calculo SAC` ou `fix: corrige erro no juros`.

## 🔗 Links Úteis e Referências
- [Entendendo Tabela SAC e Price (Banco Central)](https://www.bcb.gov.br/meubc/faqs/c/calculo-de-prestacoes)
- [Documentação Oficial do Django Rest Framework](https://www.django-rest-framework.org/)
- [Guia Rápido de Next.js](https://nextjs.org/docs)
- [Guia de Commits Semânticos](https://www.conventionalcommits.org/pt-br/v1.0.0/)
# 🛡️ CoopShield: Motor Anti-Fraude em Tempo Real

**Nível:** Difícil | **Prazo:** 45 dias

## 🎯 O Desafio
A inteligência de dados é o coração da segurança em instituições de crédito. O **CoopShield** é um dashboard de monitoramento de transações que identifica e bloqueia anomalias baseando-se em regras de negócio estabelecidas pelo time, agindo como a principal barreira de defesa da cooperativa.

## 🛠️ Requisitos
- **Backend (Motor):** Criar uma API que receba dados simulados de transações financeiras. Passar essas transações por filtros (ex: transações altas de madrugada, ou múltiplas transferências em menos de 1 minuto).
- **Frontend (Dashboard):** Um painel visual para o gestor acompanhar o volume de análises e as detecções.
- **Ação:** Bloquear automaticamente transações que caiam nas regras de fraude e emitir um alerta instantâneo no dashboard.

## 📚 Stack Tecnológica Sugerida
- **Backend:** Python + Django.
- **Frontend:** Next.js + TailwindCSS.
- **Banco de Dados:** PostgreSQL ou SQLite.

## ✅ Boas Práticas Esperadas
1. **Otimização de Consultas (Filtros):** O volume de transações será alto. Ao construir as *views* (como uma `ListView` no Django), garanta que os filtros de texto e buscas estejam corretos (ex: usar o modificador `icontains` corretamente para evitar *bugs* de case-sensitivity na busca por nomes ou locais).
2. **Arquitetura Escalável:** O código responsável por analisar a fraude deve ser modular, permitindo que novas regras de negócio sejam adicionadas facilmente no futuro sem quebrar a estrutura atual.
3. **Feedback Visual em Tempo Real:** O uso de cores (verde para seguro, vermelho para fraude) e um design limpo para que o gestor tome decisões rápidas.

## 🔗 Links Úteis e Referências
- [Django QuerySet API Reference (Filtros, Buscas e icontains)](https://docs.djangoproject.com/en/stable/ref/models/querysets/)
- [Construindo Dashboards com TailwindCSS](https://tailwindcss.com/docs/installation)
- [Entendendo Padrões de Fraude Financeira (Febraban)](https://www.febraban.org.br/)
- [SWR ou React Query para atualização de dados no Frontend](https://swr.vercel.app/)
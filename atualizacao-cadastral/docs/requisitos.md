# Sistema de Atualização Cadastral - Requisitos

## 1. Requisitos Funcionais (RF)
| RF | Descrição |
|:-------:|:-------|
| **RF01** | O sistema deve permitir que o GN crie uma solicitação de atualização de cadastro. |
| **RF02** | O sistema deve permitir ao GN escolher o tipo de alteração (Renda, Patrimônio ou Endereço). |
| **RF03** | O sistema deve permitir que o GN anexe documentos comprobatórios durante a criação da solicitação. |
| **RF04** | O sistema deve registrar o usuário criador e manter o histórico de alterações/tramitações da solicitação, bem como um controle claro de status para realização de ações. |
| **RF05** | O sistema deve permitir que o GN consulte a lista de solicitações enviadas por ele. |
| **RF06** | O sistema deve exibir o status atualizado de cada solicitação. |
| **RF07** | O sistema deve permitir a edição e o reenvio de solicitações devolvidas para ajuste. |
| **RF08** | O sistema deve rotear automaticamente a solicitação para a fila de atendimento da role correspondente. |
| **RF09** | O sistema deve permitir que o GA e o Time de Cadastro visualize os dados cadastrais do cliente, o comparativo entre dados antigos e novos, os anexos e o usuário criador. |
| **RF10** | O sistema deve permitir que o GA tome uma ação sobre a solicitação, sendo elas: (1) aprovar, (2) reprovar ou (3) devolver para o GN ajustar. |
| **RF11** | O sistema deve permitir que o Time de Cadastro tome uma das seguintes ações com a solicitação: (1) realizar a atualização, (2) reprovar ou (3) devolver ou para o GA, ou para o GN algum ajuste. |
| **RF12** | O sistema deve possuir um sistema de autenticação, que após o login, devolve uma sessão/token. |
| **RF13** | O sistema deve restringir o acesso a funcionalidades e recursos com base na role atribuída ao usuário autenticado. |
---

## 2. Requisitos Não Funcionais (RNF)
| RNF | Descrição |
|:------:|:------|
| **RNF01** | O fluxo de estado da solicitação deve ser consistente, sem mudanças arbitrárias. |
| **RNF02** | O sistema deve contar com um controle de acesso baseado em papéis (RBAC — Role-Based Access Control). |
| **RNF03** | O sistema deve ter uma API no backend para atribuir permissões, garantindo que o frontend não seja responsável pelo controle de acesso. Esconder botão não é autorização. |
| **RNF04** | O backend, para implementar as autorizações, deve considerar validação de entrada, controle de acesso por objeto, proteção contra acesso a solicitações de outras agências (quando aplicável), validação do tipo e limitação de tamanho dos arquivos, proteção de dados sensíveis (incluindo nos logs), armazenamento seguro de senhas, sessões/tokens com expiração adequada, HTTPS em ambientes reais. |
| **RNF05** | O código deve possibilitar a fácil manutenção e legibilidade, com responsabilidades bem definidas em cada componente. |
| **RNF06** | O sistema deve ter uma camada responsável pelas regras de negócios, sem depender de verificações espalhadas pelo frontend. |
| **RNF07** | Cada alteração relevante deve conter um histórico que permita a rastreabilidade de, por exemplo, criador da solicitação, usuário que aprovou, quando foi aprovada, usuário que solicitou ajuste, justificativa de ajuste, quantas vezes a solicitação foi devolvida para ajuste, usuário que efetivou a alteração, status anterior. |
| **RNF08** | O sistema deve registrar eventos importantes nos logs, com informações úteis como timestamp, request ID, usuário, operação, resultado, correlation ID. Sem registro de senhas, tokens ou dados sensíveis. |
| **RNF09** | A aplicação deve conter Health Check para verificar se o sistema está pronto para receber tráfego. |
| **RNF10** | O sistema deve ter métricas de acompanhamento de processos e fluxo de trabalho. |
| **RNF11** | A API deve refletir as regras de negócio estabelecidas para o sistema. |
| **RNF12** | O frontend deve oferecer uma experiência adequada para cada cargo. O GN precisa de um dashboard de suas solicitações contendo o nome do cliente, tipo de solicitação e status. O GA precisa da fila de solicitações aguardando análise. O Time de Cadastro precisa da fila de solicitações aprovadas aguardando efetivação. Cada usuário deve visualizar as ações que fazem sentido para seu cargo. |
| **RNF13** | Documentos devem ser associados à solicitação e possuir validações adequadas. |
---

## 3. Regras de Negócio (RN)
| RN | Descrição |
|:------:|:------|
| **RN01** | Toda solicitação devolvida pelo GA para ajuste deve, obrigatoriamente, conter uma justificativa apontando os pontos a serem corrigidos. |
| **RN02** | Toda solicitação reprovada pelo GA deve ser justificada.
| **RN03** | Toda solicitação efetivada pelo Time de Cadastro deve ter um parecer final registrado. |
| **RN04** | Dependendo da regra de acesso da instituição, o GN pode visualizar solicitações. A depender, também a consulta do histórico da solicitação. |
---
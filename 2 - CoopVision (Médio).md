# 🤖 CoopVision: Onboarding Inteligente com IA

**Nível:** Médio | **Prazo:** 45 dias

## 🎯 O Desafio
Abrir uma conta ou solicitar um serviço financeiro pode ser burocrático. O **CoopVision** moderniza esse processo utilizando Inteligência Artificial para ler documentos e extrair dados automaticamente, reduzindo o atrito para o novo cooperado.

## 🛠️ Requisitos
- **Frontend:** Tela para o usuário fazer upload de um documento (RG ou CNH).
- **Backend:** API que recebe a imagem e se integra a um modelo de IA Multimodal para extrair os dados (Nome, CPF, Data de Nascimento).
- **Fluxo:** O backend devolve os dados e o frontend preenche um formulário automaticamente para o usuário apenas confirmar.

## 📚 Stack Tecnológica Sugerida
- **Backend:** Python + Django (manipulação de imagens e requisições HTTP).
- **Frontend:** React ou Next.js.
- **Inteligência Artificial:** API do Google Gemini (ou equivalente).

## ✅ Boas Práticas Esperadas
1. **Segurança:** Nunca exponha as chaves de API da Inteligência Artificial no frontend ou no código versionado. Use variáveis de ambiente (`.env`).
2. **Tratamento de Erros (Resiliência):** O que acontece se a imagem estiver borrada? O sistema deve avisar o usuário de forma amigável, sem "quebrar" a tela.
3. **Tipagem:** Se usar React, prefira TypeScript para definir o formato exato dos dados que a IA vai retornar.

## 🔗 Links Úteis e Referências
- [Documentação da API do Google Gemini](https://ai.google.dev/docs)
- [Como usar Variáveis de Ambiente no Django](https://django-environ.readthedocs.io/)
- [Como lidar com Upload de Arquivos no React](https://react.dev/reference/react-dom/components/input#controlling-an-input-with-a-state-variable)
# 🤖 Hub de IAs: O Verificador da Verdade

Este é um sistema avançado de verificação cruzada de informações utilizando Inteligência Artificial. O objetivo é reduzir alucinações e aumentar a confiabilidade das respostas ao consultar 5 das maiores IAs do mercado simultaneamente e submeter os resultados a uma "IA Juíza" para um veredito final.

## 🚀 Como Funciona o Fluxo

1.  **Pergunta do Usuário**: O usuário insere uma dúvida complexa ou pergunta factual na interface.
2.  **Consulta Paralela (Batch)**: O sistema dispara 5 requisições assíncronas em paralelo para diferentes provedores de IA.
3.  **Coleta de Respostas**: As respostas são coletadas e exibidas individualmente em cartões visuais (mesmo que alguma falhe, as outras continuam).
4.  **Julgamento e Síntese**: O sistema envia a pergunta original e as 5 respostas recebidas para uma **IA Juíza (Gemini 2.5 Flash)**.
5.  **Veredito Final**: A IA Juíza identifica contradições, descarta erros factuais e entrega uma resposta consolidada e verificada.

## 🛠️ Tecnologias Utilizadas

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Linguagem**: JavaScript
*   **Estilização**: CSS Vanilla (Design Premium com Glassmorphism)
*   **Integrações de IA**:
    *   **Google Gemini 2.5 Flash**: Atua como uma das IAs de consulta e como a IA Juíza.
    *   **Groq (Llama 3)**: Inferência de ultra-velocidade.
    *   **Cohere (Command R)**: IA otimizada para RAG e precisão.
    *   **Mistral**: Modelo europeu de alta performance.
    *   **OpenRouter (Qwen)**: Acesso a modelos open-source de última geração.

## 📋 Pré-requisitos e Configuração

### 1. Chaves de API
Você precisará de chaves de API para os seguintes serviços (todos possuem tiers gratuitos generosos):
*   [Google AI Studio](https://aistudio.google.com/)
*   [Groq Cloud](https://console.groq.com/)
*   [Cohere Dashboard](https://dashboard.cohere.com/)
*   [Mistral Console](https://console.mistral.ai/)
*   [OpenRouter](https://openrouter.ai/)

### 2. Variáveis de Ambiente
Renomeie o arquivo `.env.example` para `.env.local` e preencha as suas chaves:
```env
GEMINI_API_KEY="sua_chave_aqui"
GROQ_API_KEY="sua_chave_aqui"
COHERE_API_KEY="sua_chave_aqui"
MISTRAL_API_KEY="sua_chave_aqui"
OPENROUTER_API_KEY="sua_chave_aqui"
```

### 3. Instalação e Execução
No diretório raiz do projeto, execute:
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```
Acesse `http://localhost:3000` no seu navegador.

## 🎨 Design e UX
O sistema foi construído com foco em estética premium:
*   **Modo Escuro Nativo**: Fundo profundo com gradientes radiais sutis.
*   **Glassmorphism**: Efeito de vidro jateado com desfoque de fundo (backdrop-filter).
*   **Feedback Visual**: Skeleton loaders que indicam o progresso de cada IA em tempo real.
*   **Responsividade**: Design adaptável para desktop, tablets e smartphones.

---
Desenvolvido como um protótipo de alta fidelidade para busca de verdade factual via IA.

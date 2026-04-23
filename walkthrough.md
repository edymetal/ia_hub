# Multi-AI Truth Verifier (Hub de IAs) 🤖⚖️

O projeto foi criado com sucesso no diretório `ia_hub` e está pronto para ser utilizado!

## O que foi desenvolvido

### 1. Arquitetura Frontend
- **Next.js (App Router)**: Configurado do zero para uma aplicação limpa e escalável.
- **Estética Premium**: 
  - Interface baseada em **Glassmorphism** (painéis semitransparentes, desfoque de fundo).
  - Tipografia moderna (*Outfit*) com gradientes atraentes.
  - Animações fluídas de "Skeleton Loading" durante a simulação/espera das respostas.

### 2. Integração Backend (Next.js API Routes)
- Rota segura em `src/app/api/ask/route.js`.
- Arquitetura assíncrona com `Promise.allSettled`, realizando 5 requisições paralelas:
  - **Gemini 2.5 Flash** (via `@google/genai`)
  - **Groq** (via REST API para Llama 3)
  - **Cohere** (via REST API para Command R)
  - **Mistral** (via REST API para Mistral Small)
  - **OpenRouter** (via REST API para Qwen Gratuito)
- **O Juiz**: O resultado consolidado das 5 IAs é enviado novamente ao Gemini 2.5 Flash, que atua como o Juiz final para verificar divergências, alucinações e apresentar o **Veredito Final**.

## Como utilizar

> [!IMPORTANT]
> **Configuração Obrigatória de Chaves (API Keys)**
> Para que as consultas reais funcionem, você precisará preencher as variáveis de ambiente.
> 1. Abra a pasta `ia_hub` no seu editor.
> 2. Localize o arquivo `.env.local` (que foi copiado de `.env.example`).
> 3. Insira suas chaves para o Google Studio, Groq, Cohere, Mistral e OpenRouter.

### Rodando Localmente

Para rodar o projeto e ver a interface maravilhosa:

```bash
cd ia_hub
npm install
npm run dev
```

> [!TIP]
> Caso alguma chave de API não esteja configurada ou você exceda a cota de algum provedor, não se preocupe! A API Route foi configurada com `Promise.allSettled`, o que significa que se o *Groq* falhar, as outras 4 ainda retornarão seus resultados, e a IA Juíza analisará as respostas que tiveram sucesso.

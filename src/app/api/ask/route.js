// Removido import do @google/genai para usar fetch nativo e evitar conflitos com Next.js

// Inicializa o cliente Gemini
// A chave é pega automaticamente de process.env.GEMINI_API_KEY
// Mas caso não tenha, vamos lidar graciosamente.

export async function POST(request) {
  try {
    const { question } = await request.json();

    if (!question) {
      return Response.json({ error: "Pergunta não fornecida" }, { status: 400 });
    }

    // Função auxiliar para medir tempo
    const timedFetch = async (fetchFn, ...args) => {
      const start = Date.now();
      try {
        const response = await fetchFn(...args);
        return { response, time: Date.now() - start };
      } catch (error) {
        return { error: error.message, time: Date.now() - start };
      }
    };

    // Preparando as 5 promessas
    const promises = [
      timedFetch(fetchGemini, question),
      timedFetch(fetchGroq, question),
      timedFetch(fetchCohere, question),
      timedFetch(fetchMistral, question),
      timedFetch(fetchOpenRouter, question),
    ];

    // Aguarda todas as 5 respostas
    const results = await Promise.all(promises);
    
    // Mapeando as respostas para o formato do frontend
    const aiResponses = [
      { id: "gemini", name: "Gemini 2.5 Flash", response: results[0].response || `⚠️ Falha: ${results[0].error}`, time: results[0].time },
      { id: "groq", name: "Groq (Llama 3)", response: results[1].response || `⚠️ Falha: ${results[1].error}`, time: results[1].time },
      { id: "cohere", name: "Cohere", response: results[2].response || `⚠️ Falha: ${results[2].error}`, time: results[2].time },
      { id: "mistral", name: "Mistral", response: results[3].response || `⚠️ Falha: ${results[3].error}`, time: results[3].time },
      { id: "openrouter", name: "OpenRouter (Qwen)", response: results[4].response || `⚠️ Falha: ${results[4].error}`, time: results[4].time },
    ];

    // Agora, o Juiz (Gemini 2.5 Pro ou Flash) analisa as respostas
    const judgeVerdict = await fetchJudgeVerdict(question, aiResponses);

    return Response.json({
      results: aiResponses,
      judgeVerdict: judgeVerdict
    });

  } catch (error) {
    console.error("Erro geral na API:", error);
    return Response.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

// --- Funções de Consulta Específicas ---

const SYSTEM_PROMPT = `
  INSTRUÇÃO OBRIGATÓRIA:
  1. Responda no EXATO MESMO IDIOMA em que a pergunta foi feita.
  2. Seja EXTREMAMENTE BREVE. No máximo 2 frases curtas.
  3. Não adicione introduções como "Aqui está sua resposta".
`;

// Função auxiliar para tratar erros de HTTP de forma amigável
async function handleApiError(res) {
  if (res.ok) return;
  const errorText = await res.text();
  
  if (res.status === 429) {
    throw new Error("Cota Gratuita Excedida (Limite de requisições atingido para este provedor).");
  } else if (res.status === 503 || res.status === 502 || res.status === 504 || res.status === 529) {
    throw new Error("Servidor Sobrecarregado no momento (Alta demanda na cota gratuita).");
  } else if (res.status === 401 || res.status === 403) {
    throw new Error("Chave de API Inválida ou sem permissão de acesso.");
  } else {
    throw new Error(`Erro Desconhecido ${res.status}: ${errorText}`);
  }
}

async function fetchGemini(question) {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY ausente no .env.local");
  
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: `${SYSTEM_PROMPT}\n\nPergunta: ${question}` }]
        }],
        tools: [{ googleSearch: {} }]
      })
    });
    
    await handleApiError(res);
    
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function fetchGroq(question) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY ausente no .env.local");
  
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ]
    })
  });
  
  await handleApiError(res);
  
  const data = await res.json();
  return data.choices[0].message.content;
}

async function fetchCohere(question) {
  if (!process.env.COHERE_API_KEY) throw new Error("COHERE_API_KEY ausente no .env.local");
  
  // Usando a nova API v2 do Cohere (conector removido pois a API descontinuou esse parâmetro)
  const res = await fetch("https://api.cohere.com/v2/chat", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.COHERE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "command-r-08-2024",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ]
    })
  });
  
  await handleApiError(res);
  
  const data = await res.json();
  // No v2, o caminho da resposta muda ligeiramente
  return data.message?.content?.[0]?.text || data.text || "Sem resposta";
}

async function fetchMistral(question) {
  if (!process.env.MISTRAL_API_KEY) throw new Error("MISTRAL_API_KEY ausente no .env.local");
  
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ]
    })
  });
  
  await handleApiError(res);
  
  const data = await res.json();
  return data.choices[0].message.content;
}

async function fetchOpenRouter(question) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY ausente no .env.local");
  
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000", 
      "X-Title": "Truth Verifier"
    },
    body: JSON.stringify({
      model: "openrouter/auto",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: question }
      ]
    })
  });
  
  await handleApiError(res);
  
  const data = await res.json();
  return data.choices[0].message.content;
}

async function fetchJudgeVerdict(question, aiResponses) {
  if (!process.env.GEMINI_API_KEY) return "Veredito indisponível: GEMINI_API_KEY ausente.";
  
  const prompt = `
  Você é uma "IA Juíza", um verificador de fatos implacável.
  O usuário fez a seguinte pergunta: "${question}"
  Abaixo estão as respostas de 5 diferentes modelos de IA:
  ${aiResponses.map(ai => `### ${ai.name}:\n${ai.response}\n`).join("\n")}
  
  Sua tarefa é analisar todas essas respostas criticamente. Desconsidere as respostas que contêm "⚠️ Falha:".
  Se TODAS as respostas apresentarem falha, responda apenas: "Veredito indisponível. Todas as IAs excederam suas cotas ou falharam."
  
  Apresente o resultado OBRIGATORIAMENTE no seguinte formato Markdown:
  **⚖️ Veredito Oficial (por Gemini 2.5 Flash):** [Sintetize a verdade direta em 1 frase]
  
  **🤖 Avaliação Individual:**
  Para cada modelo que respondeu, indique:
  - **[Nome da IA]:** ✅ Correto / ❌ Incorreto / ⚠️ Parcialmente Correto - [Breve justificativa, máximo de 1 frase]
  
  REGRA DE OURO: Responda obrigatoriamente no MESMO IDIOMA da Pergunta Original. Se a pergunta for em Inglês, responda em Inglês.
  `;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        tools: [{ googleSearch: {} }]
      })
    });
    
    await handleApiError(res);
    
    const data = await res.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini Juiz falhou. Acionando Juiz Reserva (Groq)...", error.message);
    return await fetchBackupJudgeVerdict(prompt);
  }
}

// Juiz Reserva (Redundância usando Groq/Llama-3)
async function fetchBackupJudgeVerdict(prompt) {
  if (!process.env.GROQ_API_KEY) {
    return "⚠️ Veredito indisponível: O Juiz principal falhou e a chave do Juiz Reserva (Groq) está ausente.";
  }

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Você é o Juiz Reserva. Use o formato:\n**⚖️ Veredito Oficial (por Llama 3 Reserva):** [resposta curta]\n**🔍 Análise da Corte:** [análise curta]. Responda no mesmo idioma da pergunta contida no prompt." },
          { role: "user", content: prompt }
        ]
      })
    });
    
    await handleApiError(res);
    const data = await res.json();
    return `[Juiz Reserva Llama 3] ${data.choices[0].message.content}`;
  } catch (backupError) {
    return "⚠️ Falha crítica: Tanto o Juiz Principal quanto o Reserva não conseguiram processar (possível limite de cota atingido).";
  }
}

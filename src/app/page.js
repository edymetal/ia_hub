"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import "./home.css";

export default function Home() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Mocks por enquanto
  const [results, setResults] = useState(null);
  const [judgeVerdict, setJudgeVerdict] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResults(null);
    setJudgeVerdict(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Erro na consulta");
      
      setResults(data.results);
      setJudgeVerdict(data.judgeVerdict);
    } catch (err) {
      console.error(err);
      setJudgeVerdict("Falha na consulta. Certifique-se de que configurou as API Keys no arquivo .env.local.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="hero">
        <h1 className="title">
          <span className="gradient-text">Hub de IAs:</span> O Verificador da Verdade
        </h1>
        <p className="subtitle">
          Faça uma pergunta e nós consultaremos as 5 maiores inteligências artificiais simultaneamente. 
          Por fim, uma IA Juíza analisará as divergências e entregará o veredito final e confiável.
        </p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-box">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Qual a sua dúvida complexa?" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="search-button" disabled={loading || !question.trim()}>
            {loading ? "Verificando..." : "Perguntar"}
          </button>
        </form>
      </div>

      {loading && !results && (
        <div className="results-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-panel ai-card">
              <div className="ai-header">
                <div className="skeleton skeleton-text" style={{ width: '40%', height: '1.5rem', marginBottom: 0 }}></div>
              </div>
              <div className="ai-response">
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results && (
        <div className="results-grid">
          {results.map((ai) => (
            <div key={ai.id} className="glass-panel ai-card">
              <div className="ai-header">
                <div className="ai-name">{ai.name}</div>
              </div>
              <div className="ai-response">
                {ai.response}
              </div>
            </div>
          ))}
        </div>
      )}

      {loading && results && !judgeVerdict && (
        <div className="glass-panel judge-section">
          <h2 className="judge-title gradient-text">IA Juíza analisando as respostas...</h2>
          <div className="skeleton skeleton-text" style={{ marginTop: '1rem' }}></div>
          <div className="skeleton skeleton-text"></div>
        </div>
      )}

      {judgeVerdict && (
        <div className="glass-panel judge-section" style={{ borderColor: 'var(--accent-tertiary)' }}>
          <h2 className="judge-title gradient-text">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            Veredito Final
          </h2>
          <div className="judge-response markdown">
            <ReactMarkdown>{judgeVerdict}</ReactMarkdown>
          </div>
        </div>
      )}

    </main>
  );
}

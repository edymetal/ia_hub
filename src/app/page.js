"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Search, Sparkles, Gavel, Cpu, ShieldCheck, ArrowRight, Bot, Zap, Hexagon, Wind, Network, Clock } from "lucide-react";
import "./home.css";

const getAIIcon = (id) => {
  switch (id) {
    case 'gemini': return <Sparkles size={24} color="#3b82f6" />;
    case 'groq': return <Zap size={24} color="#f59e0b" />;
    case 'cohere': return <Hexagon size={24} color="#10b981" />;
    case 'mistral': return <Wind size={24} color="#0ea5e9" />;
    case 'openrouter': return <Network size={24} color="#8b5cf6" />;
    default: return <Bot size={24} color="var(--accent-color)" />;
  }
};

export default function Home() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  
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
      setJudgeVerdict("Falha na consulta. Verifique as configurações de API no servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="hero">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '100px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1rem' }}>
          <Sparkles size={16} color="var(--accent-color)" />
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent-color)' }}>Inteligência Artificial de Ponta</span>
        </div>
        <h1 className="title">
          O <span className="gradient-text">Verificador de Verdades</span>
        </h1>
        <p className="subtitle">
          Faça uma pergunta complexa. Nós consultamos as 5 mentes artificiais mais brilhantes do mundo simultaneamente, e nossa IA Juíza entrega o veredito final e imparcial.
        </p>
      </div>

      <div className="search-section">
        <form onSubmit={handleSearch} className="search-box">
          <div style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <Search size={22} />
          </div>
          <input 
            type="text" 
            className="search-input" 
            placeholder="O que você deseja descobrir hoje?" 
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            style={{ paddingLeft: '4rem' }}
          />
          <button type="submit" className="search-button" disabled={loading || !question.trim()}>
            {loading ? "Processando..." : "Investigar"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </div>

      {loading && !results && (
        <div className="results-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass-panel ai-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="ai-header">
                <div className="skeleton" style={{ width: 32, height: 32, borderRadius: 8 }}></div>
                <div className="skeleton skeleton-text" style={{ width: '40%', height: '1.5rem', marginBottom: 0 }}></div>
              </div>
              <div className="ai-response" style={{ marginTop: '1rem' }}>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results && (
        <div className="results-grid">
          {results.map((ai, index) => (
            <div key={ai.id} className="glass-panel ai-card" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="ai-header" style={{ justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {getAIIcon(ai.id)}
                  <div className="ai-name">{ai.name}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  <Clock size={12} />
                  {ai.time > 1000 ? `${(ai.time / 1000).toFixed(2)}s` : `${ai.time}ms`}
                </div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <Cpu size={32} color="var(--accent-tertiary)" className="pulse-anim" />
            <h2 className="judge-title gradient-text" style={{ marginBottom: 0 }}>Juíza analisando os fatos...</h2>
          </div>
          <div className="skeleton skeleton-text" style={{ marginTop: '1rem' }}></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
        </div>
      )}

      {judgeVerdict && (
        <div className="glass-panel judge-section">
          <h2 className="judge-title gradient-text">
            <Gavel size={36} color="var(--accent-tertiary)" />
            Veredito Final
          </h2>
          <div className="judge-response markdown">
            <ReactMarkdown>{judgeVerdict}</ReactMarkdown>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-tertiary)', fontSize: '0.9rem', fontWeight: 600 }}>
            <ShieldCheck size={18} />
            <span>Verificação Concluída com Sucesso</span>
          </div>
        </div>
      )}

      <style jsx global>{`
        .pulse-anim {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </main>
  );
}

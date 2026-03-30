import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getHistory, submitQuery, deleteHistory, renameHistory } from '../services/api';
import { exportAsJSON, exportAsPDF } from '../services/exportUtils';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import QueryBox from '../components/QueryBox';
import SummaryCard from '../components/SummaryCard';
import ModelResponseCard from '../components/ModelResponseCard';
import Logo from '../components/Logo';
import '../styles/main.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  const [currentQueryId, setCurrentQueryId] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-scroll to bottom when new results arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [currentResult, isSubmitting]);

  const fetchHistoryData = async () => {
    try {
      setLoadingHistory(true);
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  const handleSelectHistory = (historyItem) => {
    setCurrentQueryId(historyItem._id);
    setCurrentResult(historyItem);
    setError(null);
    if (window.innerWidth < 768) {
      setIsSidebarCollapsed(true);
    }
  };

  const handleNewChat = () => {
    setCurrentQueryId(null);
    setCurrentResult(null);
    setError(null);
  };

  const handleDeleteHistory = async (id) => {
    try {
      await deleteHistory(id);
      setHistory(history.filter(item => item._id !== id));
      if (currentQueryId === id) {
        handleNewChat();
      }
    } catch (err) {
      setError('Failed to delete chat history');
    }
  };

  const handleRenameHistory = async (id, newTitle) => {
    try {
      const updated = await renameHistory(id, newTitle);
      setHistory(history.map(item => item._id === id ? { ...item, title: updated.title } : item));
      if (currentQueryId === id && currentResult) {
        setCurrentResult({ ...currentResult, title: updated.title });
      }
    } catch (err) {
      setError('Failed to rename chat');
    }
  };

  const handleSubmitNewQuery = async (queryText, selectedModels = null) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await submitQuery(queryText, selectedModels, currentQueryId);
      setCurrentResult(data);
      setCurrentQueryId(data._id);
      await fetchHistoryData();
    } catch (err) {
      setError(err.message || 'An error occurred while fetching responses.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="main-content flex-row" style={{ display: 'flex', flexDirection: 'row', width: '100%', height: '100%' }}>
      {/* Sidebar Section */}
      <Sidebar 
        history={history} 
        loadingHistory={loadingHistory}
        onSelectHistory={handleSelectHistory} 
        currentHistoryId={currentQueryId}
        onNewChat={handleNewChat}
        onDeleteHistory={handleDeleteHistory}
        onRenameHistory={handleRenameHistory}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <header style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                title="Open Sidebar"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.4rem',
                  borderRadius: 'var(--border-radius-sm)',
                  marginRight: '0.5rem'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            )}
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{currentResult?.title || 'New Chat'}</h2>
            
            {/* Visual Cloud Sync Reassurance for Cross-Device Persistence */}
            <span style={{ 
              fontSize: '0.75rem', 
              color: isSubmitting ? 'var(--text-primary)' : 'var(--text-tertiary)',
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '20px',
              background: isSubmitting ? 'var(--bg-tertiary)' : 'transparent',
              transition: 'all 0.3s ease'
            }}>
              {isSubmitting ? (
                <>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid transparent', borderTopColor: 'currentColor', animation: 'spin 1s linear infinite' }} />
                  Saving to Workspace Database...
                </>
              ) : (
                currentResult && (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                    Synced to Cloud securely
                  </>
                )
              )}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {currentResult && currentResult.turns && currentResult.turns.length > 0 && (
              <div style={{ position: 'relative', display: 'flex', gap: '0.35rem' }}>
                <button
                  onClick={() => exportAsJSON(currentResult)}
                  title="Export as JSON"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.7rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  JSON
                </button>
                <button
                  onClick={() => exportAsPDF(currentResult)}
                  title="Export as PDF"
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.7rem',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                  PDF
                </button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </header>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {error && (
            <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 'var(--border-radius-md)', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {(!currentResult || !currentResult.turns || currentResult.turns.length === 0) && !isSubmitting && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.8 }}>⚡️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Welcome back, {user?.username}</h3>
              <p style={{ fontSize: '0.875rem', marginBottom: '2rem' }}>Try a prompt template below, or type your own question.</p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '0.75rem',
                width: '100%',
                maxWidth: '700px'
              }}>
                {[
                  { 
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>, 
                    title: 'Code Review', desc: 'Analyze code quality', prompt: 'Review this code for bugs, performance issues, and best practices. Suggest improvements:\n\n```\n// paste your code here\n```' 
                  },
                  { 
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>, 
                    title: 'Explain Concept', desc: 'Clear & concise', prompt: 'Explain the following concept in very simple terms, providing clear analogies and examples:\n\n' 
                  },
                  { 
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>, 
                    title: 'Debug Code', desc: 'Find & fix errors', prompt: 'I have a bug in my code. Here is the code and the error message. Please help me find and fix the issue:\n\nCode:\n```\n// paste code\n```\n\nError:\n' 
                  },
                  { 
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>, 
                    title: 'Compare Tech', desc: 'Side-by-side analysis', prompt: 'Compare the following two technologies in detail. Cover pros, cons, performance, ecosystem, learning curve, and when to use each:\n\n' 
                  },
                  { 
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>, 
                    title: 'Summarize Text', desc: 'Condense long content', prompt: 'Summarize the following text into clear, concise bullet points. Highlight the key takeaways:\n\n' 
                  },
                  { 
                    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>, 
                    title: 'Project Ideas', desc: 'Creative inspiration', prompt: 'Suggest 5 creative and unique project ideas for a developer who wants to build something impressive. Include the tech stack, difficulty level, and a brief description for each.' 
                  }
                ].map((tmpl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const textarea = document.querySelector('textarea');
                      if (textarea) {
                        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
                        nativeSetter.call(textarea, tmpl.prompt);
                        textarea.dispatchEvent(new Event('input', { bubbles: true }));
                        textarea.focus();
                      }
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '0.35rem',
                      padding: '1rem',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s ease',
                      color: 'var(--text-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--text-tertiary)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>{tmpl.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{tmpl.title}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{tmpl.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentResult?.turns?.map((turn, turnIdx) => (
            <div key={turnIdx} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <div style={{ 
                  background: 'var(--bg-tertiary)', 
                  padding: '1rem 1.5rem', 
                  borderRadius: '20px 20px 4px 20px', 
                  maxWidth: '80%',
                  border: '1px solid var(--border-color)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ fontSize: '1.05rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{turn.query}</p>
                </div>
              </div>

              {turn.finalSummary && (
                <SummaryCard summary={turn.finalSummary} />
              )}

              {turn.responses && turn.responses.length > 0 && (() => {
                const responses = turn.responses;
                const count = responses.length;
                const isOdd = count % 2 !== 0;
                const mainCards = isOdd ? responses.slice(0, count - 1) : responses;
                const lastCard = isOdd ? responses[count - 1] : null;
                return (
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>Model Responses</h3>
                    <div className="responses-grid" style={{ gridTemplateColumns: count === 1 ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))' }}>
                      {mainCards.map((res, idx) => (
                        <div key={idx} style={{ minWidth: 0 }}>
                          <ModelResponseCard modelName={res.modelName} answer={res.answer} />
                        </div>
                      ))}
                    </div>
                    {lastCard && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', width: '100%' }}>
                        <div className="last-card-container">
                          <ModelResponseCard modelName={lastCard.modelName} answer={lastCard.answer} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>
          ))}

          {isSubmitting && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border-color)', borderTopColor: 'var(--text-primary)', animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Processing request...</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: '1rem 2rem 2rem', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
            <QueryBox onSubmit={handleSubmitNewQuery} isLoading={isSubmitting} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

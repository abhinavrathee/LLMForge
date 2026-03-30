import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getHistory, submitQuery, deleteHistory } from '../services/api';
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
              <p style={{ fontSize: '0.875rem' }}>Select your preferred models below and start a query.</p>
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

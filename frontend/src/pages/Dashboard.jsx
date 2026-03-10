import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getHistory, submitQuery, deleteHistory } from '../services/api';
import Sidebar from '../components/Sidebar';
import ThemeToggle from '../components/ThemeToggle';
import QueryBox from '../components/QueryBox';
import SummaryCard from '../components/SummaryCard';
import ModelResponseCard from '../components/ModelResponseCard';
import '../styles/main.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  const [currentQueryId, setCurrentQueryId] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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

  const handleSubmitNewQuery = async (queryText) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const data = await submitQuery(queryText, currentQueryId);
      setCurrentResult(data);
      setCurrentQueryId(data._id);
      // Reload history to show the new query in the sidebar
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
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <header style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{currentResult?.title || 'New Chat'}</h2>
          <ThemeToggle />
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {(!currentResult || !currentResult.turns || currentResult.turns.length === 0) && !isSubmitting && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', opacity: 0.6 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤖</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>How can I help you today, {user?.username}?</h3>
              <p>Type a prompt below to start a new conversation and compare models.</p>
            </div>
          )}

          {currentResult?.turns?.map((turn, turnIdx) => (
            <div key={turnIdx} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '1rem', borderLeft: '4px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: 600 }}>Your Prompt</h4>
                <p style={{ fontSize: '1.1rem' }}>{turn.query}</p>
              </div>

              {turn.finalSummary && (
                <SummaryCard summary={turn.finalSummary} />
              )}

              {turn.responses && turn.responses.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>Model Responses</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {turn.responses
                      .filter(res => res.modelName.includes('Groq') || res.modelName.includes('Gemini') || res.modelName.includes('Google') || res.modelName.includes('Llama'))
                      .map((res, idx) => (
                      <ModelResponseCard key={idx} modelName={res.modelName} answer={res.answer} />
                    ))}
                  </div>
                </div>
              )}

            </div>
          ))}

          {isSubmitting && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Synthesizing knowledge...</p>
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: '1rem 0 2rem 0', background: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <QueryBox onSubmit={handleSubmitNewQuery} isLoading={isSubmitting} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

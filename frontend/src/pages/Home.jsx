import React, {useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { AuthContext } from '../context/AuthContext';
import '../styles/main.css';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    <div className="home-container" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>L</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>LLM Forge</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <ThemeToggle />
          {user ? (
             <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
          ) : (
             <button className="btn btn-primary" onClick={() => navigate('/login')}>Login / Sign Up</button>
          )}
        </div>
      </nav>

      {/* Main Content Area: Hero & Features */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Hero Section */}
        <section style={{ padding: '6rem 2rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
            The Ultimate <span style={{ color: 'var(--accent-primary)' }}>AI Synthesis</span> Platform
          </h2>
          <p style={{ fontSize: '1.3rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Compare responses from top-tier models like Gemini Flash and Groq's Llama 3 concurrently. Get a unified summary instantly, accelerating your AI-driven workflows.
          </p>
          <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '2rem' }} onClick={() => navigate(user ? '/dashboard' : '/login')}>
            Get Started For Free
          </button>
        </section>

        {/* Features / About Section */}
        <section id="features" style={{ padding: '4rem 2rem', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: '700', textAlign: 'center', marginBottom: '3rem' }}>Why use LLM Forge?</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
              
              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚡</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Concurrent Generation</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Query multiple state-of-the-art models simultaneously, drastically reducing the time spent jumping between different chat interfaces.</p>
              </div>

              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🧠</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Smart Synthesis</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Receive an aggregated executive summary that combines the best insights from Gemini and Llama 3 into a single, cohesive answer.</p>
              </div>

              <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>History tracking</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>Easily save, search, and manage your past AI queries in your personal dashboard with our persistent conversational history.</p>
              </div>

            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
         <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>© {new Date().getFullYear()} LLM Forge. Designed with precision.</p>
      </footer>
    </div>
  );
};

export default Home;

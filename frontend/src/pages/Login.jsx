import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import '../styles/main.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      result = await register(username, email, password);
    }

    if (!result?.success) {
      setError(result?.message || 'Authentication failed');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="home-container" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '2rem', overflowY: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>L</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>LLM Forge</h1>
        </div>
        <ThemeToggle />
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', paddingBottom: '2rem' }}>
        <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className="btn" 
              style={{ flex: 1, background: isLogin ? 'var(--bg-tertiary)' : 'transparent', color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Sign In
            </button>
            <button 
              className="btn" 
              style={{ flex: 1, background: !isLogin ? 'var(--bg-tertiary)' : 'transparent', color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.9rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
            
            {!isLogin && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Username</label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required={!isLogin} 
                  placeholder="johndoe"
                />
              </div>
            )}
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Email</label>
              <input 
                type="email" 
                className="input-field" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
              <input 
                type="password" 
                className="input-field" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Processing...' : (isLogin ? 'Sign In to Dashboard' : 'Create Account')}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;

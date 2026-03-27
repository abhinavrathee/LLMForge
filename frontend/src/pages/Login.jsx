import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import '../styles/main.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    // Maximum Frontend Validation
    if (!isLogin) {
      if (password !== confirmPassword) {
        return setError('Passwords do not match');
      }
      if (username.length < 3 || username.length > 20 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        return setError('Username must be 3-20 characters and contain only letters, numbers, or underscores.');
      }
      if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])/.test(password)) {
        return setError('Security Alert: Password must be 8+ characters, with an uppercase letter, a lowercase letter, a number, and a special character.');
      }
    }

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

  const fillDemoCredentials = () => {
    setIsLogin(true);
    setEmail('demo@llmforge.dev');
    setPassword('Demo@1234');
    setError('');
  };

  return (
    <div className="home-container" style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '2rem', overflowY: 'auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div style={{ cursor: 'pointer', transition: 'transform 0.2s ease' }} onClick={() => navigate('/')} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
          <Logo width={36} height={36} />
        </div>
        <ThemeToggle />
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: '2.5rem', paddingBottom: '2rem', flexWrap: 'wrap' }}>

        {/* ── Left Note Panel ── */}
        <div style={{
          width: '100%', maxWidth: '320px', padding: '1.75rem',
          borderRadius: '16px', border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)', alignSelf: 'flex-start',
          display: 'flex', flexDirection: 'column', gap: '1rem',
          marginTop: '0.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📋</span>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Recruiter / Visitor Note</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
            You can explore the full LLMForge experience using the <strong style={{ color: 'var(--text-primary)' }}>Demo Credentials</strong> below — no sign-up needed.
          </p>

          <div style={{
            padding: '0.85rem 1rem', borderRadius: '10px',
            background: 'var(--bg-tertiary)', border: '1px dashed var(--border-color)',
            fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.7'
          }}>
            <div style={{ marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Email: </span>demo@llmforge.dev
            </div>
            <div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Password: </span>Demo@1234
            </div>
          </div>

          <div style={{
            padding: '0.9rem', borderRadius: '10px',
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
            display: 'flex', gap: '0.6rem', alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: '1rem', flexShrink: 0, marginTop: '1px' }}>⚠️</span>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              If the API isn't responding, it may be due to <strong style={{ color: '#fbbf24' }}>free-tier credits being exhausted</strong>. Reach out and I'll walk you through it personally.
            </p>
          </div>

          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: '1.5', opacity: 0.75 }}>
            📬 Want a live walkthrough? <a href="mailto:anujkumar142000@gmail.com" style={{ color: 'var(--text-primary)', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Contact me</a> — happy to demo it for you directly.
          </p>
        </div>

        {/* ── Login Form ── */}
        <div className="breathtaking-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem', borderRadius: '16px', borderTop: '4px solid var(--text-primary)' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button 
              className="btn" 
              style={{ flex: 1, background: isLogin ? 'var(--bg-tertiary)' : 'transparent', color: isLogin ? 'var(--text-primary)' : 'var(--text-secondary)', border: isLogin ? '1px solid var(--border-color)' : '1px solid transparent' }}
              onClick={() => { setIsLogin(true); setError(''); setPassword(''); setConfirmPassword(''); }}
            >
              Sign In
            </button>
            <button 
              className="btn" 
              style={{ flex: 1, background: !isLogin ? 'var(--bg-tertiary)' : 'transparent', color: !isLogin ? 'var(--text-primary)' : 'var(--text-secondary)', border: !isLogin ? '1px solid var(--border-color)' : '1px solid transparent' }}
              onClick={() => { setIsLogin(false); setError(''); setPassword(''); setConfirmPassword(''); }}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {error && (
              <div style={{ padding: '0.75rem', borderRadius: 'var(--border-radius-md)', background: 'var(--bg-tertiary)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '0.875rem', textAlign: 'center' }}>
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
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="input-field" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  style={{ width: '100%', paddingRight: '2.5rem' }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                  {showPassword ? 
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  }
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Confirm Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    className="input-field" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required={!isLogin}
                    placeholder="••••••••"
                    style={{ width: '100%', paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '0.75rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}>
                    {showConfirmPassword ? 
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    }
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? 'Processing...' : (isLogin ? 'Sign In to Dashboard' : 'Create Account')}
            </button>
          </form>

          {/* ── Demo Credentials Bar ── */}
          <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', letterSpacing: '0.02em' }}>
              🔍 &nbsp;Just exploring? Use demo access
            </p>
            <button
              type="button"
              onClick={fillDemoCredentials}
              style={{
                width: '100%', padding: '0.7rem 1rem',
                borderRadius: '10px', cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
                border: '1px solid rgba(139,92,246,0.35)',
                color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.22), rgba(139,92,246,0.22))'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.6)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              Use Demo Credentials
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.5rem', opacity: 0.65 }}>
              Fills in the form automatically — just hit Sign In
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { loginWithEmail, signupWithEmail } from '../services/api';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (tab === 'signin') {
        user = await loginWithEmail(email, password);
      } else {
        if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
        user = await signupWithEmail(name.trim(), email, password);
      }
      localStorage.setItem('ebc_logged_in', 'true');
      if (onLogin) onLogin(user);
      else navigate('/discover');
    } catch (err) {
      const msg = err?.message || '';
      if (msg.includes('Invalid credentials') || msg.includes('401')) {
        setError('Wrong email or password. Try again.');
      } else if (msg.includes('already exists') || msg.includes('409')) {
        setError('An account with this email already exists. Sign in instead.');
      } else if (msg.includes('password')) {
        setError('Password must be at least 8 characters.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'transparent',
    border: '1.5px solid var(--border-medium)',
    borderRadius: 10, fontSize: '0.9375rem',
    color: 'var(--text-primary)', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
    fontFamily: 'var(--font-sans)',
  };

  return (
    <div style={{
      height: '100dvh', background: 'var(--bg)', display: 'flex',
      flexDirection: 'column', overflowY: 'auto', position: 'relative',
    }}>
      {/* Header */}
      <header style={{
        padding: '0 40px', height: 60, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span style={{ fontFamily: 'var(--font-logo)', fontWeight: 800, fontSize: '1.75rem', letterSpacing: '-0.03em', lineHeight: 1 }}>EBC</span>
        </div>
        <button className="btn btn-ghost" style={{ fontSize: '0.875rem', padding: '6px 14px' }} onClick={() => navigate('/')}>
          Back to home
        </button>
      </header>

      {/* Main — 2-col split */}
      <div className="login-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: '420px 1fr', minHeight: 0 }}>

        {/* Left — Auth Form */}
        <div className="login-form-col" style={{
          padding: '48px 40px', display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--border)',
        }}>
          <div style={{ fontFamily: 'var(--font-logo)', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--primary)', marginBottom: 24 }}>EBC</div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: '1px solid var(--border)' }}>
            {[['signin', 'Sign In'], ['signup', 'Create Account']].map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                style={{
                  flex: 1, padding: '10px 0', background: 'none', border: 'none',
                  fontFamily: 'var(--font-sans)', fontSize: '0.9375rem',
                  fontWeight: tab === t ? 700 : 500,
                  color: tab === t ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                  marginBottom: -1, cursor: 'pointer', transition: 'all 0.2s',
                }}
              >{label}</button>
            ))}
          </div>

          <h1 style={{
            fontSize: '1.75rem', fontWeight: 500, fontFamily: 'var(--font-display)',
            letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 28, lineHeight: 1.2,
          }}>
            {tab === 'signin' ? 'Welcome back.' : 'Join EBC.'}
          </h1>

          {error && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: 'rgba(242,87,48,0.08)', border: '1px solid rgba(242,87,48,0.25)',
              borderRadius: 10, padding: '12px 14px', marginBottom: 20,
              fontSize: '0.875rem', color: 'var(--red)', lineHeight: 1.5,
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {tab === 'signup' && (
              <input
                type="text" placeholder="Full name" value={name}
                onChange={e => setName(e.target.value)} required style={inputStyle}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-medium)'}
              />
            )}
            <input
              type="email" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)} required style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-medium)'}
            />
            <input
              type="password" placeholder={tab === 'signup' ? 'Password (min 8 chars)' : 'Password'}
              value={password} onChange={e => setPassword(e.target.value)}
              required minLength={8} style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-medium)'}
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{
              width: '100%', padding: '14px', fontSize: '1rem',
              borderRadius: 10, justifyContent: 'center', marginTop: 4,
              opacity: loading ? 0.7 : 1,
            }}>
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: 28, lineHeight: 1.6, textAlign: 'center' }}>
            By continuing, you agree to EBC's{' '}
            <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Terms of Service</span>{' '}
            and{' '}
            <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>
        </div>

        {/* Right — Info panel */}
        <div className="login-right-panel" style={{
          padding: '56px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '20%', right: '-10%', width: '50%', height: '60%', background: 'radial-gradient(ellipse, rgba(3,212,124,0.08) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 520 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
              EBC Smart Events, Seamless Outcomes
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 500, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', marginBottom: 24, lineHeight: 1.15 }}>
              Hyderabad's most<br />curated professional<br />community.
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 40 }}>
              Verified founders, investors, and builders. Sign in to browse the full directory, register for meetups, and connect with real people.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { n: '120+', l: 'Verified Members' },
                { n: '28+', l: 'Meetups Hosted' },
                { n: '48h', l: 'Avg. Application Review' },
              ].map(s => (
                <div key={s.l} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--primary)', minWidth: 60 }}>{s.n}</div>
                  <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Giant Watermark */}
      <div style={{ textAlign: 'center', overflow: 'hidden', lineHeight: 0.75, userSelect: 'none', pointerEvents: 'none', marginTop: 'auto' }}>
        <span style={{
          fontSize: 'clamp(120px, 28vw, 420px)', fontWeight: 800,
          fontFamily: 'var(--font-logo)', letterSpacing: '-0.04em',
          color: 'var(--text-primary)', opacity: 0.03, display: 'block',
          transform: 'translateY(15%)',
        }}>
          EBC
        </span>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sun, Moon, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import RightPanel from './components/RightPanel';
import MobileNav from './components/MobileNav';
import { getSession, logout as appwriteLogout, getCurrentUser } from './services/api';
import OnboardingModal from './components/OnboardingModal';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Discover from './pages/Discover';
import Directory from './pages/Directory';
import Profile from './pages/Profile';
import MyProfile from './pages/MyProfile';
import Settings from './pages/Settings';
import Meetups from './pages/Meetups';
import MeetupDetail from './pages/MeetupDetail';
import AdminPanel from './pages/AdminPanel';
import Registrations from './pages/Registrations';

// ── Animated page wrapper ─────────────────────────────────────────────
// The `key` is set at the call site so React fully unmounts+remounts
// this component on every route change, retriggering the CSS animation.
function PageTransition({ children }) {
  return (
    <div className="page-transition">
      {children}
    </div>
  );
}

function MainLayout({ children, isLoggedIn, onLogout, theme, toggleTheme, currentUser }) {
  const location = useLocation();
  const showChrome = isLoggedIn && location.pathname !== '/';

  if (!showChrome) {
    return <div className="app-landing-layout">{children}</div>;
  }

  const isProfilePage = location.pathname.startsWith('/profile/') && location.pathname !== '/profile/me';
  const isMePage = location.pathname === '/profile/me';
  const isSettingsPage = location.pathname === '/settings';
  const isMeetupsPage = location.pathname.startsWith('/meetups') && !location.pathname.match(/^\/meetups\/[a-zA-Z0-9_-]+$/);
  const isMeetupDetailPage = location.pathname.match(/^\/meetups\/[a-zA-Z0-9_-]+$/);
  const isRegistrationsPage = location.pathname === '/registrations';

  return (
    <div className="app-layout">
      <Sidebar onLogout={onLogout} theme={theme} toggleTheme={toggleTheme} currentUser={currentUser} />

      <div className="main-content-col">
        {/* Mobile Top Header */}
        <div className="mobile-header" style={{
          display: 'none', // Overridden in media queries to flex
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'var(--glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 150
        }}>
          <span style={{ fontFamily: 'var(--font-logo)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            EBC
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={toggleTheme}
              style={{
                border: 'none',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
              onClick={onLogout}
              style={{
                border: 'none',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--red)',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {children}
      </div>

      {!isProfilePage && !isMePage && !isSettingsPage && !isMeetupsPage && !isRegistrationsPage && (
        <RightPanel currentUser={currentUser} />
      )}

      {!isMeetupDetailPage && <MobileNav />}
    </div>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [theme, setTheme] = useState(() => localStorage.getItem('ebc_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ebc_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // On mount: check Appwrite session
  useEffect(() => {
    getSession().then(user => {
      if (user) {
        setIsLoggedIn(true);
        // Also try to match to a member profile by email
        getCurrentUser(user).then(setCurrentUser);
      }
      setAuthLoading(false);
    });
  }, []);

  const login = (user) => {
    setIsLoggedIn(true);
    getCurrentUser(user).then(setCurrentUser);
  };

  const logout = async () => {
    await appwriteLogout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('ebc_logged_in');
  };

  const ProtectedRoute = ({ children }) => {
    if (authLoading) return null;
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return children;
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100dvh', background: 'var(--bg)', display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>Loading…</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {currentUser?.needsOnboarding && (
        <OnboardingModal 
          user={currentUser} 
          onComplete={(profile) => setCurrentUser(profile)} 
        />
      )}
      <MainLayout isLoggedIn={isLoggedIn} onLogout={logout} theme={theme} toggleTheme={toggleTheme} currentUser={currentUser}>
        <AnimatedRoutesWrapper
          isLoggedIn={isLoggedIn}
          currentUser={currentUser}
          ProtectedRoute={ProtectedRoute}
          login={login}
          logout={logout}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </MainLayout>
    </BrowserRouter>
  );
}

function AnimatedRoutesWrapper({ isLoggedIn, currentUser, ProtectedRoute, login, logout, theme, toggleTheme }) {
  const location = useLocation();
  return (
    <PageTransition key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={isLoggedIn ? <Navigate to="/discover" replace /> : <Landing onLogin={login} theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/discover" replace /> : <Login onLogin={login} />} />
        <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
        <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
        <Route path="/meetups" element={<ProtectedRoute><Meetups /></ProtectedRoute>} />
        <Route path="/meetups/:id" element={<ProtectedRoute><MeetupDetail /></ProtectedRoute>} />
        <Route path="/registrations" element={<ProtectedRoute><Registrations currentUser={currentUser} /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel session={currentUser} /></ProtectedRoute>} />
        <Route path="/profile/me" element={<ProtectedRoute><MyProfile currentUser={currentUser} /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/settings" element={<ProtectedRoute><Settings onLogout={logout} currentUser={currentUser} /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  );
}

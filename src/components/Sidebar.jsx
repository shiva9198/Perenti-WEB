import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, User, Settings, Moon, Sun, Calendar, Shield, Ticket } from 'lucide-react';
import Avatar from './Avatar';

const ADMIN_EMAILS = ['admin@EBC.com', 'sreemadhav@gmail.com', 'madhav@ebc.com'];

export default function Sidebar({ onLogout, theme, toggleTheme, currentUser }) {
  const navigate = useNavigate();

  const isAdmin = currentUser && (
    ADMIN_EMAILS.includes(currentUser.email) ||
    currentUser.email?.includes('@EBC') ||
    currentUser.email?.includes('@ebc')
  );

  const nav = [
    { to: '/discover', label: 'Discover', icon: Home },
    { to: '/directory', label: 'Directory', icon: Users },
    { to: '/meetups', label: 'Meetups', icon: Calendar },
    { to: '/registrations', label: 'My Passes', icon: Ticket },
    { to: '/profile/me', label: 'My Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <nav className="sidebar">
      {/* Brand — text-only wordmark */}
      <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/discover')}>
        <div className="logo-wrap">
          <span className="logo-text" style={{ fontFamily: 'var(--font-logo)', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.03em' }}>EBC</span>
        </div>
      </div>

      {/* Nav Links */}
      <div className="nav-links">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={() => `nav-link ${(to === '/meetups' ? location.pathname.startsWith('/meetups') : location.pathname === to) ? 'active' : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Theme Toggle */}
      <div style={{ padding: '0 var(--space-3)', marginTop: 'auto', marginBottom: 'var(--space-2)' }}>
        <button
          onClick={toggleTheme}
          style={{
            width: '100%', border: 'none', background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)',
            transition: 'background var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {theme === 'dark'
              ? <Moon size={20} color="var(--text-secondary)" />
              : <Sun size={20} color="var(--text-secondary)" />}
            <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </div>
          {/* Toggle pill */}
          <div style={{
            width: 36, height: 20, borderRadius: 999,
            background: theme === 'dark' ? 'var(--primary)' : 'var(--border-strong)',
            position: 'relative', transition: 'background 0.3s', flexShrink: 0,
          }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 2,
              left: theme === 'dark' ? 18 : 2,
              transition: 'left 0.3s',
            }} />
          </div>
        </button>
      </div>

      {/* Sidebar Profile */}
      {currentUser && (
        <div
          className="sidebar-profile"
          onClick={() => navigate('/settings')}
          title="Go to Settings"
        >
          <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">{currentUser.name || 'Member'}</div>
            <div className="sidebar-profile-tag">
              {isAdmin ? 'Admin' : (currentUser.profession || 'Member')}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

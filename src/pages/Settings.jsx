import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, CreditCard, Wallet, Bolt, Sliders, Users, Lock,
  HelpCircle, ExternalLink, Info, Lightbulb, Heart, Edit2,
  ChevronRight, ArrowLeft, Share, LogOut
} from 'lucide-react';
import Avatar from '../components/Avatar';

const MENU = [
  {
    title: 'Account',
    items: [
      { id: 'profile', icon: User, label: 'Profile' },
      { id: 'preferences', icon: Sliders, label: 'Preferences' },
      { id: 'security', icon: Lock, label: 'Security' },
    ],
  },
  {
    title: 'Community',
    items: [
      { id: 'verification', icon: CreditCard, label: 'Verification', badge: 'Verified' },
      { id: 'referrals', icon: Users, label: 'Referrals' },
    ],
  },
  {
    title: 'General',
    items: [
      { id: 'help', icon: HelpCircle, label: 'Help & Support' },
      { id: 'about', icon: Info, label: 'About EBC' },
    ],
  },
];

export default function Settings({ onLogout, currentUser }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  if (!currentUser) return null;

  const handleSignOut = () => {
    localStorage.setItem('ebc_logged_in', 'false');
    if (onLogout) onLogout();
    navigate('/');
  };

  const renderProfileContent = () => (
    <div style={{ maxWidth: 640 }}>
      {/* Expensify-style dark card for profile fields */}
      <div style={{ background: 'var(--bg)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>

        {/* Card Header section */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Public</div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            These details are displayed on your public profile. Anyone can see them.
          </div>

          <div style={{ marginTop: 24, position: 'relative', display: 'inline-block' }}>
            <div style={{ padding: 4, background: 'var(--bg-elevated)', borderRadius: '50%' }}>
              <Avatar src={currentUser.avatar} name={currentUser.name} size="xl" />
            </div>
            <div style={{
              position: 'absolute', bottom: 0, right: 0, width: 28, height: 28,
              background: 'var(--bg-elevated)', border: '2px solid var(--bg)', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
            }}>
              <Edit2 size={12} color="var(--text-primary)" />
            </div>
          </div>
        </div>

        {/* List items */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { label: 'Display name', value: currentUser.name },
            { label: 'Contact methods', value: 'hello@ebc.com' },
            { label: 'Status', value: '' },
            { label: 'Pronouns', value: 'Select your pronouns', isPlaceholder: true },
            { label: 'Timezone', value: 'Asia/Kolkata' },
          ].map((field, i, arr) => (
            <div key={field.label} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 24px', borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border)',
              cursor: 'pointer', transition: 'background 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{field.label}</div>
                <div style={{ fontSize: '0.9375rem', color: field.isPlaceholder ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>
                  {field.value}
                </div>
              </div>
              <ChevronRight size={18} color="var(--text-tertiary)" />
            </div>
          ))}
        </div>

        {/* Action area */}
        <div style={{ padding: '16px 24px 24px' }}>
          <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            <Share size={14} style={{ marginRight: 6 }} /> Share
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100%', background: 'var(--bg-card)' }}>

      {/* LEFT PANE - Navigation Menu */}
      <div style={{
        width: 320, flexShrink: 0, borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto'
      }}>

        {/* Left header */}
        <div style={{ padding: '24px', fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          Account
        </div>

        {/* Small Profile Card inline */}
        <div style={{ padding: '0 24px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar src={currentUser.avatar} name={currentUser.name} size="md" style={{ borderRadius: '50%', background: 'var(--bg-elevated)' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser.name}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                hello@ebc.com
              </div>
            </div>
          </div>
        </div>

        {/* Menu Sections */}
        <div style={{ flex: 1, padding: '0 12px 24px' }}>
          {MENU.map(section => (
            <div key={section.title} style={{ marginBottom: 24 }}>
              <div style={{
                fontSize: '0.8125rem', color: 'var(--text-secondary)',
                padding: '0 12px 12px', fontWeight: 500
              }}>
                {section.title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {section.items.map(item => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '12px', borderRadius: 8, cursor: 'pointer',
                        background: isActive ? 'var(--bg-elevated)' : 'transparent',
                        position: 'relative'
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      {isActive && (
                        <div style={{
                          position: 'absolute', left: 0, top: 8, bottom: 8, width: 4,
                          background: 'var(--primary)', borderRadius: '0 4px 4px 0'
                        }} />
                      )}
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', background: isActive ? 'var(--primary-glow)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: isActive ? 6 : 0, transition: 'all 0.2s'
                      }}>
                        <Icon size={18} color={isActive ? 'var(--primary)' : 'var(--text-primary)'} />
                      </div>
                      <div style={{ flex: 1, fontSize: '0.9375rem', fontWeight: isActive ? 600 : 500, color: 'var(--text-primary)' }}>
                        {item.label}
                      </div>
                      {item.badge && (
                        <div style={{
                          fontSize: '0.6875rem', fontWeight: 600, background: 'rgba(3,212,124,0.15)',
                          color: 'var(--primary)', padding: '2px 8px', borderRadius: 999
                        }}>
                          {item.badge}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Sign Out Button */}
          <div style={{ marginTop: 24, padding: '0 12px' }}>
            <div
              onClick={handleSignOut}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '12px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(255,77,79,0.05)', transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,79,0.1)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,77,79,0.05)'}
            >
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <LogOut size={18} color="#ff4d4f" />
              </div>
              <div style={{ flex: 1, fontSize: '0.9375rem', fontWeight: 600, color: '#ff4d4f' }}>
                Sign Out
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE - Detailed Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Right header */}
        <div style={{
          height: 80, display: 'flex', alignItems: 'center', gap: 16,
          padding: '0 32px', borderBottom: '1px solid transparent'
        }}>
          {/* Mobile back button (hidden on desktop, but good for structure) */}
          <User size={24} color="var(--primary)" />
          <div style={{ fontSize: '1.25rem', fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            Profile
          </div>
        </div>

        {/* Right Scrollable Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 32px 64px' }}>
          {activeTab === 'profile' && renderProfileContent()}
          {activeTab !== 'profile' && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Settings for {activeTab} will appear here.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

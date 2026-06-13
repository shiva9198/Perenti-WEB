import React from 'react';
import { Shield, TrendingUp, MapPin } from 'lucide-react';
import Avatar from '../components/Avatar';
import LottiePlayer from '../components/LottiePlayer';

export default function MyProfile({ currentUser }) {
  if (!currentUser) return null;

  return (
    <div className="main-feed">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-title">My Profile</div>
          <button className="btn btn-secondary btn-sm">
            <Shield size={14} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="profile-cover"></div>

      <div className="profile-hero">
        <Avatar src={currentUser.avatar} name={currentUser.name} size="3xl" />

        <div className="profile-header-info">
          <div className="profile-info-left">
            <div className="profile-name">{currentUser.name}</div>
            <div className="profile-role">{currentUser.profession}</div>
            <div className="profile-location">
              <MapPin size={13} /> {currentUser.area || 'Hyderabad, India'}
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn btn-primary">
              <TrendingUp size={16} /> Complete Your Profile
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="profile-main-column">
          {/* Profile Completion */}
          <div className="profile-section-card" style={{ borderColor: 'var(--primary)', background: 'var(--primary-glow)', marginBottom: 20 }}>
            <h4 style={{ color: 'var(--primary)' }}>Profile Completion — 40%</h4>
            <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, marginBottom: 12, overflow: 'hidden' }}>
              <div style={{ width: '40%', height: '100%', background: 'var(--primary)', borderRadius: 999 }} />
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Add your LinkedIn, bio, and what you're looking for to unlock full visibility.
            </p>
          </div>

          {/* Lottie Hero */}
          <div style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <LottiePlayer src="/business_team.json" style={{ width: 100, height: 100, flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 500, fontSize: '1.25rem', fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: 8 }}>
                  You're part of EBC!
                </div>
                <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Every member gets a profile. Turn yourself into a discoverable person for the Hyderabad startup community.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}

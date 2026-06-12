import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, MapPin, Search, Lightbulb, Rocket, Building2, MessageCircle, Star } from 'lucide-react';
import { fetchMembers } from '../services/api';
import Avatar from '../components/Avatar';
import Tag from '../components/Tag';
import { LinkedinIcon, InstagramIcon } from '../components/Icons';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const isLoggedIn = localStorage.getItem('ebc_logged_in') === 'true';
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers().then(data => {
      const found = data.find(m => String(m.id) === String(id));
      setMember(found || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="main-feed" style={{ padding: 48, textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading profile...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="main-feed" style={{ padding: 48, textAlign: 'center', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 16 }}>Profile Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>The member profile you are trying to view does not exist.</p>
        <Link to={isLoggedIn ? "/discover" : "/"} className="btn btn-primary">Go to Home</Link>
      </div>
    );
  }

  const openLink = (url) => {
    if (url) window.open(url, '_blank');
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/discover');
    }
  };

  const handleJoinClick = () => {
    localStorage.setItem('ebc_logged_in', 'true');
    navigate('/discover');
  };

  return (
    <div className="main-feed" style={!isLoggedIn ? { maxWidth: '1000px', margin: '0 auto', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', minHeight: '100dvh', background: 'var(--bg)' } : {}}>
      {/* Sticky guest callout if not logged in */}
      {!isLoggedIn && (
        <div style={{
          background: 'linear-gradient(90deg, var(--primary-dark), var(--bg-secondary))',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--primary)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-logo)', letterSpacing: '-0.03em', color: '#fff' }}>Perenti</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>
              You're viewing a profile on Perenti. Connect with Hyderabad's top builders.
            </span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleJoinClick} style={{ boxShadow: 'none' }}>
            Join Perenti Network
          </button>
        </div>
      )}

      {/* Header */}
      <div className="page-header" style={{ position: 'sticky', top: !isLoggedIn ? 53 : 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon-sm" onClick={handleBack}>
            <ChevronLeft size={22} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Profile</span>
        </div>
      </div>

      <div className="profile-cover">
        {/* Cover Background styling is in CSS */}
      </div>

      <div className="profile-hero">
        <Avatar src={member.avatar} name={member.name} size="3xl" />
        
        <div className="profile-header-info">
          <div className="profile-info-left">
            <div className="profile-name">{member.name}</div>
            <div className="profile-role">{member.profession}</div>
            <div className="profile-location">
              <MapPin size={13} /> {member.area}
            </div>
            
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
              {member.tags && member.tags.map(t => <Tag key={t} label={t} />)}
            </div>
          </div>
          
          <div className="profile-actions">
            {member.linkedIn && (
              <button className="btn btn-secondary btn-sm" onClick={() => openLink(member.linkedIn)}>
                <LinkedinIcon size={15} color="var(--blue)" /> LinkedIn
              </button>
            )}
            {member.instagram && (
              <button className="btn btn-secondary btn-sm" onClick={() => openLink(member.instagram)}>
                <InstagramIcon size={15} color="var(--orange)" /> Instagram
              </button>
            )}
            <button className="btn btn-primary" onClick={() => openLink(member.linkedIn || 'https://linkedin.com')}>
              <MessageCircle size={18} /> Connect
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="profile-main-column">
          {/* About */}
          <div className="profile-section-card animate-in animate-in-delay-1">
            <h4>About</h4>
            <p>{member.bio}</p>
          </div>

          {/* Looking for / Can Help */}
          <div className="profile-row-cards animate-in animate-in-delay-3">
            <div className="profile-half-card">
              <div className="profile-icon-wrap">
                <Search size={16} color="var(--text-primary)" />
              </div>
              <h5>Looking For</h5>
              <p>{member.whatTheyExpect}</p>
            </div>
            <div className="profile-half-card">
              <div className="profile-icon-wrap">
                <Lightbulb size={16} color="var(--primary)" />
              </div>
              <h5>Can Help With</h5>
              <p>{member.howTheyCanHelp}</p>
            </div>
          </div>
        </div>
        
        <div className="profile-side-column">
          {/* Work */}
          {(member.startupName || member.companyName) && (
            <div className="profile-section-card animate-in animate-in-delay-2" style={{ marginBottom: 20 }}>
              <h4>Current Work</h4>
              {member.startupName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Rocket size={16} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>Startup</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{member.startupName}</div>
                  </div>
                </div>
              )}
              {member.companyName && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Building2 size={16} color="var(--text-secondary)" />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 2 }}>Company</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{member.companyName}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Why Joined */}
          <div className="profile-section-card animate-in animate-in-delay-2">
            <h4>Why I Joined Perenti</h4>
            <p>{member.whyJoined}</p>
          </div>
        </div>
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}

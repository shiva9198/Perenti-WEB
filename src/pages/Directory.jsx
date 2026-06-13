import React, { useState, useEffect } from 'react';
import { Search, X, Users } from 'lucide-react';
import { fetchMembers, FILTER_TAGS } from '../services/api';
import { MemberCardHorizontal } from '../components/MemberCard';

export default function Directory() {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers().then(data => {
      setMembers(data);
      setLoading(false);
    });
  }, []);

  const getMembersByTag = (tag) => {
    if (tag === 'All') return members;
    return members.filter(m => 
      (m.tags && m.tags.includes(tag)) || 
      (m.profession && m.profession.toLowerCase().includes(tag.toLowerCase())) || 
      (m.area && m.area.toLowerCase().includes(tag.toLowerCase()))
    );
  };

  const filtered = getMembersByTag(activeFilter).filter(m =>
    (m.name && m.name.toLowerCase().includes(search.toLowerCase())) ||
    (m.profession && m.profession.toLowerCase().includes(search.toLowerCase())) ||
    (m.area && m.area.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="main-feed">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="page-title">Directory</div>
          </div>
          <div className="skeleton skeleton-card" style={{ height: 42, marginBottom: 14 }} />
          <div className="filter-bar" style={{ gap: 8 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ width: 80, height: 32, borderRadius: 999 }} />
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg-card)' }}>
              <div className="skeleton skeleton-avatar" style={{ width: 44, height: 44 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div className="skeleton skeleton-title" style={{ width: '60%' }} />
                <div className="skeleton skeleton-text" style={{ width: '40%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="main-feed">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div className="page-title">Directory</div>
          <div style={{ marginLeft: 'auto', fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
            <span className="pulse-dot" style={{ marginRight: 6 }} />
            {members.length} members
          </div>
        </div>
        
        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 14 }}>
          <Search size={18} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members, roles, areas…"
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ color: 'var(--text-tertiary)', display: 'flex' }}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter chips */}
        <div className="filter-bar">
          {FILTER_TAGS.map(tag => (
            <button
              key={tag}
              className={`filter-chip ${activeFilter === tag ? 'active' : ''}`}
              onClick={() => setActiveFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 24px' }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <Users size={48} style={{ marginBottom: 16 }} />
            <p style={{ fontSize: '0.9375rem' }}>No members found for "{search}"</p>
          </div>
        ) : (
          <div className="grid-list">
            {filtered.map((m, i) => (
              <div key={m.id} className="animate-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <MemberCardHorizontal member={m} />
              </div>
            ))}
          </div>
        )}
        <div style={{ height: 'calc(96px + env(safe-area-inset-bottom, 0px))' }} />
      </div>
    </div>
  );
}

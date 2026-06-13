import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { fetchMeetups, createSlug } from '../services/api';

export default function Meetups() {
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetups().then(data => {
      const active = Array.isArray(data) ? data.filter(m => m.is_active !== false) : [];
      setMeetups(active);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  // Sort and group meetups
  const sortedMeetups = [...meetups].sort((a, b) => {
    const dateA = new Date((a.date || '').replace(/(st|nd|rd|th)/, ''));
    const dateB = new Date((b.date || '').replace(/(st|nd|rd|th)/, ''));
    if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
      return dateA.getTime() - dateB.getTime();
    }
    return 0;
  });

  const grouped = [];
  sortedMeetups.forEach(m => {
    const dateStr = m.date || 'TBD';
    let group = grouped.find(g => g.date === dateStr);
    if (!group) {
      group = { date: dateStr, items: [] };
      grouped.push(group);
    }
    group.items.push(m);
  });

  if (loading) {
    return (
      <div className="main-feed" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading events…</div>
      </div>
    );
  }

  return (
    <div className="main-feed" style={{ overflowY: 'auto' }}>
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-title gradient-text">Events Directory</div>
        </div>
      </div>

      <div style={{ padding: '32px 24px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        {grouped.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Calendar size={48} color="var(--border-strong)" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>No upcoming events</div>
            <div style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Check back later.</div>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: 28, margin: '10px 0' }}>
            {/* Timeline line */}
            <div style={{
              position: 'absolute',
              top: 10,
              bottom: 10,
              left: 4,
              width: 1,
              background: 'var(--border-strong)',
              zIndex: 1
            }} />
            
            {grouped.map((group) => (
              <div key={group.date} style={{ marginBottom: 36, position: 'relative', zIndex: 2 }}>
                {/* Timeline Dot & Date Header */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, position: 'relative' }}>
                  {/* Bullet dot */}
                  <div style={{
                    position: 'absolute',
                    left: -28,
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    border: '2px solid var(--bg)',
                    boxShadow: '0 0 0 1px var(--border-strong)',
                    marginLeft: 1
                  }} />
                  
                  <div style={{ 
                    fontFamily: 'var(--font-sans)', 
                    fontSize: '0.8125rem', 
                    fontWeight: 700, 
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    paddingLeft: 8
                  }}>
                    {group.date}
                  </div>
                </div>

                {/* Event Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingLeft: 8 }}>
                  {group.items.map(meetup => (
                    <Link 
                      key={meetup.id} 
                      to={`/meetups/${createSlug(meetup.title)}`} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--bg-card)', 
                        border: '1px solid var(--border)', 
                        borderRadius: 18, 
                        padding: '20px 24px', 
                        transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s', 
                        cursor: 'pointer', 
                        textDecoration: 'none',
                        gap: 20
                      }}
                      onMouseEnter={e => { 
                        e.currentTarget.style.transform = 'translateY(-1px)'; 
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        e.currentTarget.style.background = 'var(--bg-elevated)';
                      }}
                      onMouseLeave={e => { 
                        e.currentTarget.style.transform = 'none'; 
                        e.currentTarget.style.boxShadow = 'none'; 
                        e.currentTarget.style.background = 'var(--bg-card)';
                      }}
                    >
                      {/* Left: Content */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                          {meetup.time}
                        </div>
                        
                        <h3 style={{ 
                          fontFamily: 'var(--font-display)', 
                          fontSize: '1.25rem', 
                          fontWeight: 600, 
                          color: 'var(--text-primary)', 
                          marginBottom: 8, 
                          lineHeight: 1.25 
                        }}>
                          {meetup.title}
                        </h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          <MapPin size={14} style={{ flexShrink: 0 }} />
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {meetup.venue}
                          </span>
                        </div>
                      </div>

                      {/* Right: Small Poster Image */}
                      {meetup.banner_url && (
                        <div style={{ 
                          width: 80, 
                          height: 80, 
                          borderRadius: 12, 
                          overflow: 'hidden', 
                          flexShrink: 0,
                          border: '1px solid var(--border-medium)',
                          background: 'var(--bg-elevated)'
                        }}>
                          <img 
                            src={meetup.banner_url} 
                            alt={meetup.title} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          />
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ height: 80 }} />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { fetchUserReservations } from '../services/api';
import { Calendar, MapPin, Clock, Ticket, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Registrations({ currentUser }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.email) {
      fetchUserReservations(currentUser.email)
        .then(res => {
          setReservations(Array.isArray(res) ? res : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="main-feed" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading passes…</div>
      </div>
    );
  }

  return (
    <div className="main-feed" style={{ overflowY: 'auto' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Perenti Wallet</div>
            <div className="page-title gradient-text">My Entry Passes</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        {reservations.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '2px dashed var(--border-medium)', borderRadius: 20, padding: '48px 24px', textAlign: 'center', marginTop: 20 }}>
            <Ticket size={48} color="var(--border-strong)" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 8 }}>No passes found</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.9rem', maxWidth: 300, margin: '0 auto 20px' }}>
              You haven't registered for any upcoming meetups yet.
            </p>
            <Link to="/meetups" className="btn btn-primary" style={{ display: 'inline-flex', justifyContent: 'center', margin: '0 auto' }}>
              Browse Meetups
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {reservations.map(res => {
              const m = res.meetup;
              if (!m) return null;

              const isCheckedIn = res.status === 'checked_in';

              return (
                <div 
                  key={res.id} 
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 20,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                >
                  {/* Left accent color border */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: 6,
                    background: isCheckedIn ? '#03d47c' : 'var(--primary)',
                    zIndex: 2
                  }} />

                  {/* Pass Layout */}
                  <div className="ticket-body" style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
                    {/* Event Details Section */}
                    <div style={{ flex: '1 1 320px', padding: '24px 28px', minWidth: 260 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 700, 
                          padding: '4px 10px', 
                          borderRadius: 999, 
                          background: isCheckedIn ? 'rgba(3,212,124,0.1)' : 'var(--primary-glow)', 
                          color: isCheckedIn ? '#03d47c' : 'var(--primary)', 
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          border: `1px solid ${isCheckedIn ? 'rgba(3,212,124,0.2)' : 'rgba(3,212,124,0.1)'}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}>
                          {isCheckedIn ? <CheckCircle size={10} /> : <Ticket size={10} />}
                          {isCheckedIn ? 'checked in' : 'active pass'}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {res.quantity} {res.quantity === 1 ? 'Attendee' : 'Attendees'}
                        </span>
                      </div>

                      <h3 style={{ 
                        fontFamily: 'var(--font-display)', 
                        fontSize: '1.35rem', 
                        fontWeight: 700, 
                        color: 'var(--text-primary)', 
                        marginBottom: 16,
                        lineHeight: 1.25
                      }}>
                        {m.title}
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Calendar size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                          <span>{m.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Clock size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                          <span>{m.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <MapPin size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 2 }} />
                          <span>{m.venue}</span>
                        </div>
                      </div>

                      <div style={{ marginTop: 24 }}>
                        <Link to={`/meetups/${m.id}`} className="btn btn-ghost btn-sm" style={{ padding: '6px 0', fontSize: '0.8125rem' }}>
                          View Event Details &rarr;
                        </Link>
                      </div>
                    </div>

                    {/* Dashed Separator Line (Simulating physical ticket stub cut line) */}
                    <div className="ticket-qr-col" style={{
                      flex: '0 0 100%',
                      display: 'block',
                      height: 0,
                      borderTop: '2px dashed var(--border-medium)',
                      position: 'relative'
                    }}>
                      {/* Ticket notches left and right */}
                      <div style={{ position: 'absolute', top: -8, left: -8, width: 16, height: 16, borderRadius: '50%', background: 'var(--bg)', borderRight: '1px solid var(--border)' }} />
                      <div style={{ position: 'absolute', top: -8, right: -8, width: 16, height: 16, borderRadius: '50%', background: 'var(--bg)', borderLeft: '1px solid var(--border)' }} />
                    </div>

                    {/* QR Code / Ticket ID Section */}
                    <div style={{ 
                      flex: '1 1 180px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      padding: '24px 28px',
                      background: 'var(--bg-elevated)',
                      borderTopRightRadius: 20,
                      borderBottomRightRadius: 20
                    }}>
                      <div style={{
                        background: '#ffffff',
                        padding: 8,
                        borderRadius: 12,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        marginBottom: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border)'
                      }}>
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${res.ticket_id}`} 
                          alt="Ticket Entry QR Code" 
                          width="120" 
                          height="120"
                          style={{ display: 'block' }}
                        />
                      </div>
                      <div style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '0.75rem', 
                        color: 'var(--text-secondary)',
                        background: 'var(--bg)',
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid var(--border-medium)',
                        fontWeight: 600,
                        letterSpacing: '0.05em'
                      }}>
                        {res.ticket_id}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 6, textAlign: 'center' }}>
                        Present at entrance for scan verification
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ height: 80 }} />
    </div>
  );
}

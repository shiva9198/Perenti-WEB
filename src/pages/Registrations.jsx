import React, { useState, useEffect } from 'react';
import { fetchUserReservations } from '../services/api';
import { Calendar, MapPin, Clock, Ticket, CheckCircle, AlertCircle, MessageCircle, Clock3, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';
import { ADMIN_WHATSAPP_NUMBER, buildWhatsAppUrl, buildRegistrationMessage } from '../config/whatsapp';
import { cachedFetch } from '../services/cache.js';

function AttendeeBadgeQR({ reservation }) {
  let reason = 'Networking';
  try {
    const answersObj = JSON.parse(reservation.answers || '{}');
    reason = answersObj.lookingFor || answersObj.building || answersObj.role || 'Networking';
  } catch (e) {}

  const qrData = JSON.stringify({
    name: reservation.user_name || 'Attendee',
    passes: reservation.quantity || 1,
    reason: reason
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&color=061b0f&bgcolor=ffffff`;

  const downloadQR = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendee-pass.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code', error);
    }
  };

  return (
    <div style={{ padding: '20px 28px', borderTop: '1px solid var(--border)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
      <div style={{ flex: 1, minWidth: 200 }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Attendee Pass</h4>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>Show this public QR pass to organizers.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.85rem', background: 'var(--bg-elevated)', padding: '12px', borderRadius: 8, border: '1px solid var(--border)' }}>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Name:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{reservation.user_name || 'Attendee'}</span></div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Passes:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{reservation.quantity || 1}</span></div>
          <div><strong style={{ color: 'var(--text-secondary)' }}>Reason:</strong> <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{reason}</span></div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <img src={qrUrl} alt="Attendee Pass QR" style={{ width: 100, height: 100, borderRadius: 8, border: '1px solid var(--border)' }} />
        <button onClick={downloadQR} type="button" className="btn btn-secondary btn-sm">Download QR</button>
      </div>
    </div>
  );
}

export default function Registrations({ currentUser }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (currentUser?.email) {
      const cacheKey = `user_reservations_${currentUser.email}`;
      cachedFetch(cacheKey, () => fetchUserReservations(currentUser.email))
        .then(res => {
          setReservations(Array.isArray(res) ? res : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [currentUser]);

  // Split by status
  const pendingReservations = reservations.filter(r =>
    r.status === 'pending_payment' &&
    r.expires_at &&
    new Date(r.expires_at) > new Date()
  );
  const expiredReservations = reservations.filter(r =>
    r.status === 'expired' ||
    r.status === 'rejected' ||
    (r.status === 'pending_payment' && r.expires_at && new Date(r.expires_at) <= new Date())
  );
  const confirmedReservations = reservations.filter(r =>
    r.status === 'confirmed' || r.status === 'checked_in'
  );

  const openWhatsApp = (res) => {
    const m = res.meetup;
    const msg = buildRegistrationMessage({
      eventName: m?.title || 'EBC Meetup',
      userName: res.user_name || currentUser?.name || '',
      passes: res.quantity || 1,
    });
    window.open(buildWhatsAppUrl(ADMIN_WHATSAPP_NUMBER, msg), '_blank');
  };

  if (loading) {
    return (
      <div className="main-feed">
        {/* Header — renders instantly */}
        <div className="page-header">
          <div className="page-header-inner">
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>EBC Wallet</div>
              <div className="page-title gradient-text">My Entry Passes</div>
            </div>
          </div>
        </div>
        {/* Skeleton pass cards */}
        <div style={{ padding: '24px', maxWidth: 680, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className="skeleton-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
              {/* Accent bar */}
              <div className="skeleton" style={{ height: 6, width: '100%', borderRadius: 0 }} />
              <div style={{ padding: '24px 28px', display: 'flex', gap: 20 }}>
                {/* Left: event info */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="skeleton skeleton-text" style={{ width: 80 }} />
                  <div className="skeleton skeleton-title" style={{ width: '70%' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                    <div className="skeleton skeleton-text" style={{ width: '55%' }} />
                    <div className="skeleton skeleton-text" style={{ width: '45%' }} />
                    <div className="skeleton skeleton-text" style={{ width: '60%' }} />
                  </div>
                </div>
                {/* Right: QR placeholder */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div className="skeleton" style={{ width: 120, height: 120, borderRadius: 12 }} />
                  <div className="skeleton skeleton-text" style={{ width: 80 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="main-feed" style={{ overflowY: 'auto' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>EBC Wallet</div>
            <div className="page-title gradient-text">My Entry Passes</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '24px', maxWidth: 680, margin: '0 auto', width: '100%' }}>

        {/* ── Pending Registrations Section ── */}
        {pendingReservations.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Clock3 size={14} style={{ color: 'var(--orange, #FF7101)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Pending Approval</h3>
              <span style={{ background: 'rgba(255,113,1,0.15)', color: 'var(--orange, #FF7101)', fontWeight: 700, fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999 }}>{pendingReservations.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingReservations.map(res => {
                const m = res.meetup;
                return (
                  <div key={res.id} style={{ background: 'var(--bg-card)', border: '1.5px solid rgba(255,113,1,0.3)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ background: 'rgba(255,113,1,0.08)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,113,1,0.15)' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--orange, #FF7101)' }}>⏳ Awaiting Payment Verification</span>
                      <span style={{ background: 'rgba(255,113,1,0.15)', color: 'var(--orange, #FF7101)', fontWeight: 700, fontSize: '0.65rem', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Approval</span>
                    </div>
                    <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{m?.title || 'EBC Meetup'}</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {m?.date && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} /><span>{m.date}</span></div>}
                        {m?.venue && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} /><span>{m.venue}</span></div>}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Ticket size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} /><span>{res.quantity} {res.quantity === 1 ? 'Pass' : 'Passes'}</span></div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 10, marginTop: 4 }}>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Request expires in</span>
                        <CountdownTimer expiresAt={res.expires_at} />
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>Complete your payment through WhatsApp and send the payment screenshot to the administrator. Your pass will be generated after approval.</p>
                      <button onClick={() => openWhatsApp(res)} className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start' }}>
                        <MessageCircle size={14} /> Open WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Expired / Rejected Section ── */}
        {expiredReservations.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <XCircle size={14} style={{ color: 'var(--red)' }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Expired / Not Approved</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {expiredReservations.map(res => {
                const m = res.meetup;
                const isRejected = res.status === 'rejected';
                return (
                  <div key={res.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{m?.title || 'EBC Meetup'}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', margin: '0 0 12px', lineHeight: 1.5 }}>
                        {isRejected ? 'Your registration was not approved. Please re-register if interested.' : 'This registration request expired before payment was confirmed.'}
                      </p>
                      {m?.id && <Link to={`/meetups/${m.id}`} className="btn btn-ghost btn-sm" style={{ padding: '4px 0', fontSize: '0.8rem' }}>Register Again →</Link>}
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(242,87,48,0.1)', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {isRejected ? 'Not Approved' : 'Expired'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Active / Confirmed Passes (existing unchanged) ── */}
        {confirmedReservations.length === 0 && pendingReservations.length === 0 && expiredReservations.length === 0 ? (
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
        ) : confirmedReservations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {confirmedReservations.map(res => {
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
                  <AttendeeBadgeQR reservation={res} />
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      <div style={{ height: 80 }} />
    </div>
  );
}
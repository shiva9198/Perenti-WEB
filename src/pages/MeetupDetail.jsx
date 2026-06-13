import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Share2, Check, X, ChevronDown, ChevronUp, AlertCircle, ChevronLeft, MessageCircle, Clock3 } from 'lucide-react';
import Avatar from '../components/Avatar';
import CountdownTimer from '../components/CountdownTimer';
import { fetchMeetup, fetchReservations, createReservation, getSession, createPendingReservation, checkExistingPending, fetchUserReservations } from '../services/api';
import { ADMIN_WHATSAPP_NUMBER, buildWhatsAppUrl, buildRegistrationMessage } from '../config/whatsapp';

// (Removed AttendeeBadgeQR and TicketStub — replaced by PassModal)

// ── Checked-In Attendee Card (Ultra Mobile Friendly) ──────────────────────────
function CheckedInAttendeeCard({ reservation }) {
  const initials = (reservation.user_name || reservation.user_email || '?').charAt(0).toUpperCase();

  let answersObj = {};
  try {
    answersObj = JSON.parse(reservation.answers || '{}');
  } catch (e) {
    answersObj = {};
  }

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '16px',
      marginBottom: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'var(--primary-glow)', border: '1px solid rgba(3,212,124,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)',
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {reservation.user_name || 'Member'}
          </div>
          {answersObj.role && (
            <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
              {answersObj.role}
            </div>
          )}
        </div>
        <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--primary)', background: 'var(--primary-glow)', padding: '4px 10px', borderRadius: 999, border: '1px solid rgba(3,212,124,0.2)' }}>
          Here
        </div>
      </div>

      {(answersObj.building || answersObj.lookingFor) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--border)', paddingTop: 10, fontSize: '0.8125rem' }}>
          {answersObj.building && (
            <div>
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Building: </span>
              <span style={{ color: 'var(--text-secondary)' }}>{answersObj.building}</span>
            </div>
          )}
          {answersObj.lookingFor && (
            <div>
              <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Looking for: </span>
              <span style={{ color: 'var(--text-secondary)' }}>{answersObj.lookingFor}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pass Modal (Premium Digital Pass) ─────────────────────────────────────────
function PassModal({ ticket, meetup, onClose }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(ticket.ticket_id)}&color=061b0f&bgcolor=ffffff`;

  const downloadQR = async () => {
    try {
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EBC-Pass-${ticket.ticket_id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download QR code', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `EBC Pass: ${meetup.title}`,
          text: `I'm attending ${meetup.title} on ${meetup.date}!`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
      {/* Container */}
      <div style={{ width: '100%', height: '100%', maxWidth: 420, maxHeight: '100%', overflowY: 'auto', background: 'var(--bg)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
          <span style={{ fontFamily: 'var(--font-logo)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>EBC pass</span>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '0 20px 40px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ width: '100%', maxWidth: 340, background: 'var(--bg-card)', borderRadius: 24, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
            {/* Banner Area */}
            {meetup.banner_url ? (
              <img src={meetup.banner_url} alt={meetup.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: 120, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: '#fff' }}>EBC</span>
              </div>
            )}

            {/* Content Area */}
            <div style={{ padding: 24, textAlign: 'center', borderBottom: '2px dashed var(--border-medium)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>EBC Community</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: 12 }}>{meetup.title}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <span>📅 {meetup.date}</span>
                <span>⏰ {meetup.time}</span>
                <span>📍 {meetup.venue}</span>
              </div>
            </div>

            {/* QR Area */}
            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff' }}>
              <img src={qrUrl} alt="Pass QR" style={{ width: 200, height: 200, marginBottom: 16 }} />
              <div style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', letterSpacing: '0.1em' }}>{ticket.ticket_id}</div>
            </div>

            {/* Footer Area */}
            <div style={{ padding: 20, background: 'var(--primary)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>Participant</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{ticket.user_name || ticket.user_email}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', opacity: 0.8 }}>Status</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14}/> Approved</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ width: '100%', maxWidth: 340, display: 'flex', gap: 12, marginTop: 24 }}>
            <button onClick={downloadQR} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', padding: '14px', borderRadius: 16 }}>
              Download QR
            </button>
            <button onClick={handleShare} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '14px', borderRadius: 16 }}>
              Share Pass
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Registration Capsule (Bottom Sticky Bar) ──────────────────────────────────
function RegistrationCapsule({ meetup, status, remaining, onAction }) {
  // Status mapping
  let btnText = 'Register Now';
  let btnBg = 'var(--primary)';
  let btnColor = '#000';
  let disabled = false;

  if (status === 'EVENT_FULL') {
    btnText = 'Registration Closed';
    btnBg = 'var(--bg-elevated)';
    btnColor = 'var(--text-tertiary)';
    disabled = true;
  } else if (status === 'PENDING') {
    btnText = 'Pending Approval';
    btnBg = 'rgba(255,113,1,0.15)';
    btnColor = 'var(--orange, #FF7101)';
    disabled = false; // Clicking will open WhatsApp pending info
  } else if (status === 'APPROVED') {
    btnText = 'View Pass';
    btnBg = 'var(--primary)';
    btnColor = '#000';
  } else if (status === 'REJECTED') {
    btnText = 'Register Again';
    btnBg = 'var(--bg-elevated)';
    btnColor = 'var(--text-primary)';
  }

  // Portal to document.body so position:fixed is not broken
  // by the PageTransition ancestor's CSS transform animation.
  return createPortal(
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 150,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      background: 'linear-gradient(to top, var(--bg) 60%, transparent)',
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        margin: '12px 16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 999,
        padding: '8px 8px 8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 600,
        boxShadow: '0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        gap: 16,
        pointerEvents: 'auto',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {meetup.title}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            {meetup.date} • {meetup.time}
          </div>
        </div>
        <button
          onClick={onAction}
          disabled={disabled}
          className="btn"
          style={{
            background: btnBg,
            color: btnColor,
            border: 'none',
            padding: '12px 20px',
            borderRadius: 999,
            fontSize: '0.875rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            flexShrink: 0,
            opacity: disabled && status === 'EVENT_FULL' ? 0.6 : 1,
          }}
        >
          {btnText}
        </button>
      </div>
    </div>,
    document.body
  );
}


// ── Attendee Row ─────────────────────────────────────────────────────────────
function AttendeeRow({ reservation }) {
  const initials = (reservation.user_name || reservation.user_email || '?').charAt(0).toUpperCase();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
        background: 'var(--primary-glow)', border: '1px solid rgba(3,212,124,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)',
      }}>{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {reservation.user_name || 'Member'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {reservation.user_email}
        </div>
      </div>
      <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-glow)', padding: '3px 8px', borderRadius: 999, flexShrink: 0 }}>
        {reservation.quantity} pass{reservation.quantity > 1 ? 'es' : ''}
      </div>
    </div>
  );
}

// ── Registration Flow Modal ───────────────────────────────────────────────────
function RegisterModal({ meetup, session, onClose, onSuccess, initialPendingRecord }) {
  // step: 'checking' | 'form' | 'submitting' | 'submitting_pending' | 'done' | 'pending' | 'already_pending'
  const [step, setStep] = useState(initialPendingRecord ? 'already_pending' : 'checking');
  const [qty, setQty] = useState(1);
  const [name, setName] = useState(session?.name || '');
  const [email, setEmail] = useState(session?.email || '');
  const [answers, setAnswers] = useState({ building: '', role: 'Founder', lookingFor: '' });
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState(null);
  const [pendingRecord, setPendingRecord] = useState(initialPendingRecord || null); // existing pending registration

  // Pricing & Coupon states
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const BASE_PRICE = 422;
  const totalAmount = BASE_PRICE * qty;
  const discount = couponApplied ? totalAmount : 0;
  const netAmount = totalAmount - discount;

  const remaining = meetup?.remaining ?? meetup?.capacity ?? 60;

  // On mount: check for an existing active pending registration for this event
  useEffect(() => {
    if (initialPendingRecord) return; // Already handled by prop
    const check = async () => {
      const userEmail = session?.email || '';
      if (!userEmail || !meetup?.id) { setStep('form'); return; }
      const existing = await checkExistingPending(userEmail, meetup.id);
      if (existing) {
        setPendingRecord(existing);
        setStep('already_pending');
      } else {
        setStep('form');
      }
    };
    check();
  }, [session?.email, meetup?.id, initialPendingRecord]);

  const handleApplyCoupon = () => {
    if (coupon.trim().toLowerCase() === 'ebc42') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponApplied(false);
      setCouponError('Invalid coupon code');
    }
  };

  const openWhatsApp = (record) => {
    const msg = buildRegistrationMessage({
      eventName: meetup?.title || 'EBC Meetup',
      userName: record?.user_name || name.trim() || email.split('@')[0],
      passes: record?.quantity || qty,
    });
    const url = buildWhatsAppUrl(ADMIN_WHATSAPP_NUMBER, msg);
    window.open(url, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required to register.'); return; }
    setError('');

    const resolvedName = name.trim() || email.split('@')[0];
    const registrationData = {
      meetup_id: meetup.id,
      user_email: email.trim().toLowerCase(),
      user_name: resolvedName,
      quantity: qty,
      answers: JSON.stringify({ ...answers, role: answers.role }),
    };

    if (netAmount === 0) {
      // ── Free path (coupon applied): existing direct confirmation flow ──────
      setStep('submitting');
      try {
        const res = await createReservation(registrationData);
        setTicket(res);
        setStep('done');
        onSuccess();
      } catch (err) {
        setError(err?.response?.data?.detail || err?.message || 'Registration failed. Please try again.');
        setStep('form');
      }
    } else {
      // ── Paid path: create pending reservation → redirect to WhatsApp ───────
      setStep('submitting_pending');
      try {
        const res = await createPendingReservation(registrationData);
        setPendingRecord(res);
        setStep('pending');
        openWhatsApp(res);
        onSuccess(); // refresh attendee count to reflect the hold
      } catch (err) {
        setError(err?.response?.data?.detail || err?.message || 'Failed to submit registration. Please try again.');
        setStep('form');
      }
    }
  };

  // ── Shared modal shell ────────────────────────────────────────────────────
  const modalTitle = {
    checking: 'Register for Meetup',
    form: 'Register for Meetup',
    submitting: 'Registering…',
    submitting_pending: 'Submitting…',
    done: "You're In!",
    pending: 'Registration Submitted',
    already_pending: 'Pending Registration',
  }[step] || 'Register for Meetup';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(6,27,15,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg-card)', borderRadius: 20, width: '100%', maxWidth: 520,
        maxHeight: '90dvh', overflow: 'auto', border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
            {modalTitle}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 4, borderRadius: 8 }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>

          {/* ── Checking state ── */}
          {step === 'checking' && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-secondary)' }}>Checking…</div>
          )}

          {/* ── Confirmed (free coupon path) — existing QR flow untouched ── */}
          {step === 'done' && ticket && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--primary-glow)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.5rem' }}>✓</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Registration Confirmed!</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>Your pass has been generated successfully.</div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={onClose} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>View Pass</button>
              </div>
            </div>
          )}

          {/* ── Pending payment submitted ── */}
          {step === 'pending' && pendingRecord && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,113,1,0.15)', border: '2px solid var(--orange, #FF7101)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.5rem' }}>⏳</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Registration Submitted</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Your registration request has been received. Complete your payment through WhatsApp and send the payment screenshot to the administrator.
                </div>
              </div>

              {/* Info row */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 14, padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Status</span>
                  <span style={{ background: 'rgba(255,113,1,0.15)', color: 'var(--orange, #FF7101)', fontWeight: 700, fontSize: '0.75rem', padding: '3px 10px', borderRadius: 999, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Pending Approval</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Event</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{meetup?.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Name</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pendingRecord.user_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Passes</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pendingRecord.quantity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}><Clock3 size={14} /> Request expires in</span>
                  <CountdownTimer expiresAt={pendingRecord.expires_at} />
                </div>
              </div>

              <div style={{ background: 'rgba(255,113,1,0.08)', border: '1px solid rgba(255,113,1,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 20, fontSize: '0.8125rem', color: 'var(--orange, #FF7101)', lineHeight: 1.6 }}>
                Admin approval is required before your event pass is generated. This request will expire in 10 minutes if payment is not completed.
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => openWhatsApp(pendingRecord)}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <MessageCircle size={16} /> Open WhatsApp
                </button>
                <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Done</button>
              </div>
            </div>
          )}

          {/* ── Already has an active pending request ── */}
          {step === 'already_pending' && pendingRecord && (
            <div>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,113,1,0.15)', border: '2px solid var(--orange, #FF7101)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.5rem' }}>⏳</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Registration Pending</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  You already have an active registration request. Please complete your payment and send the screenshot to the administrator.
                </div>
              </div>

              {/* Info row */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 14, padding: 20, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Status</span>
                  <span style={{ background: 'rgba(255,113,1,0.15)', color: 'var(--orange, #FF7101)', fontWeight: 700, fontSize: '0.75rem', padding: '3px 10px', borderRadius: 999, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Pending Approval</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Passes</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pendingRecord.quantity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', borderTop: '1px solid var(--border)', paddingTop: 10, marginTop: 4 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}><Clock3 size={14} /> Expires in</span>
                  <CountdownTimer expiresAt={pendingRecord.expires_at} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => openWhatsApp(pendingRecord)}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <MessageCircle size={16} /> Open WhatsApp
                </button>
                <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Close</button>
              </div>
            </div>
          )}

          {/* ── Registration Form ── */}
          {(step === 'form' || step === 'submitting' || step === 'submitting_pending') && (
            <form onSubmit={handleSubmit}>
              {/* Qty selector */}
              <div style={{ marginBottom: 20, padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>Number of Passes</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid var(--border-medium)', borderRadius: 8, overflow: 'hidden', background: 'var(--bg-card)' }}>
                  <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} style={{ border: 'none', background: 'none', padding: '8px 12px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.1rem' }}>−</button>
                  <span style={{ padding: '0 12px', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{qty}</span>
                  <button type="button" onClick={() => setQty(q => Math.min(remaining, q + 1))} style={{ border: 'none', background: 'none', padding: '8px 12px', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '1.1rem' }}>+</button>
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your Details</div>

              {/* Name + Email — prefilled from Appwrite session */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Full Name <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.9rem', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>Email <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.9rem', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>

              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Attendee Details</div>

              {/* Form questions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>What are you building? <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input required value={answers.building} onChange={e => setAnswers(a => ({ ...a, building: e.target.value }))}
                    placeholder="Describe your startup, project, or role…"
                    style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.9rem', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 }}>Your Role</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {['Founder', 'Investor', 'Student', 'Professional'].map(r => (
                      <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 10, border: `1px solid ${answers.role === r ? 'var(--primary)' : 'var(--border)'}`, background: answers.role === r ? 'var(--primary-glow)' : 'var(--bg-elevated)', cursor: 'pointer', fontSize: '0.875rem', color: answers.role === r ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: answers.role === r ? 700 : 500, transition: 'all 0.15s' }}>
                        <input type="radio" name="role" value={r} checked={answers.role === r} onChange={() => setAnswers(a => ({ ...a, role: r }))} style={{ display: 'none' }} />
                        {answers.role === r && <Check size={14} />}
                        {r}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 600 }}>What are you looking for?</label>
                  <input value={answers.lookingFor} onChange={e => setAnswers(a => ({ ...a, lookingFor: e.target.value }))}
                    placeholder="Co-founder, customers, investors…"
                    style={{ width: '100%', padding: '11px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.9rem', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              </div>

              {/* Payment & Coupon Section */}
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Payment Summary</div>

              <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '16px', marginBottom: 20 }}>
                {/* Coupon Input */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <input
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder="Enter Coupon (e.g. ebc42)"
                    style={{ flex: 1, padding: '9px 12px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: '0.85rem', color: 'var(--text-primary)', outline: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0 16px', borderRadius: 8, fontSize: '0.8125rem' }}
                  >
                    Apply
                  </button>
                </div>
                {couponError && <div style={{ color: 'var(--red)', fontSize: '0.75rem', marginBottom: 12, fontWeight: 500 }}>{couponError}</div>}
                {couponApplied && <div style={{ color: 'var(--primary)', fontSize: '0.75rem', marginBottom: 12, fontWeight: 700 }}>✓ Code EBC42 applied successfully! 100% off.</div>}

                {/* Pricing Summary rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Pass Ticket (₹422 x {qty})</span>
                    <span>₹{totalAmount}</span>
                  </div>
                  {couponApplied && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 600 }}>
                      <span>Discount (100%)</span>
                      <span>-₹{totalAmount}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9375rem' }}>
                    <span>Total Amount</span>
                    <span>₹{netAmount}</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp info note when payment is required */}
              {netAmount > 0 && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(255,113,1,0.08)', border: '1px solid rgba(255,113,1,0.2)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: '0.8125rem', color: 'var(--orange, #FF7101)', lineHeight: 1.6 }}>
                  <MessageCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Clicking <strong>Pay Now</strong> will submit your registration and open WhatsApp to complete payment. Your pass will be generated after admin verification.</span>
                </div>
              )}

              {error && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', background: 'rgba(242,87,48,0.08)', border: '1px solid rgba(242,87,48,0.25)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, fontSize: '0.875rem', color: 'var(--red)' }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={step === 'submitting' || step === 'submitting_pending'}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '1rem', borderRadius: 12, opacity: (step === 'submitting' || step === 'submitting_pending') ? 0.7 : 1 }}
              >
                {step === 'submitting' || step === 'submitting_pending'
                  ? 'Submitting…'
                  : netAmount === 0
                    ? `Confirm Free — ${qty} Pass${qty > 1 ? 'es' : ''}`
                    : `Pay Now — ₹${netAmount}`
                }
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Meetup Detail Page ────────────────────────────────────────────────────────
export default function MeetupDetail() {
  const { id } = useParams();
  const [selected, setSelected] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [userReservation, setUserReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [session, setSession] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [attendeeTab, setAttendeeTab] = useState('checked_in');

  // Load session
  useEffect(() => {
    getSession().then(setSession);
  }, []);

  // Load single meetup
  useEffect(() => {
    fetchMeetup(id).then(data => {
      setSelected(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  // Load all attendees
  const loadReservations = useCallback(() => {
    if (!selected?.id) return;
    fetchReservations(selected.id).then(data => {
      setReservations(Array.isArray(data) ? data : []);
    });
  }, [selected?.id]);

  // Load current user's specific reservation
  const loadUserReservation = useCallback(async () => {
    if (!selected?.id || !session?.email) return;
    const allUserRes = await fetchUserReservations(session.email);
    const eventRes = allUserRes.find(r => r.meetup_id === selected.id || r.meetup?.id === selected.id);
    setUserReservation(eventRes || null);
  }, [selected?.id, session?.email]);

  useEffect(() => { 
    loadReservations(); 
  }, [loadReservations]);

  useEffect(() => {
    loadUserReservation();
  }, [loadUserReservation]);

  const totalAttendees = reservations.reduce((sum, r) => sum + (r.quantity || 1), 0);
  const remaining = selected ? Math.max(0, (selected.capacity || 60) - totalAttendees) : 0;

  // Determine user status
  let userStatus = 'NOT_REGISTERED';
  if (userReservation) {
    const s = userReservation.status;
    const isExpired = s === 'expired' || (s === 'pending_payment' && userReservation.expires_at && new Date(userReservation.expires_at) <= new Date());
    
    if (s === 'confirmed' || s === 'checked_in') userStatus = 'APPROVED';
    else if (s === 'pending_payment' && !isExpired) userStatus = 'PENDING';
    else if (s === 'rejected') userStatus = 'REJECTED';
    else if (isExpired) userStatus = 'NOT_REGISTERED'; // Allow retry
  } else if (remaining === 0) {
    userStatus = 'EVENT_FULL';
  }

  const handleCapsuleAction = () => {
    if (userStatus === 'APPROVED') {
      setShowPassModal(true);
    } else if (userStatus === 'NOT_REGISTERED' || userStatus === 'REJECTED') {
      setShowModal(true);
    } else if (userStatus === 'PENDING') {
      // Show WhatsApp instructions again
      setShowModal(true);
    }
  };

  const checkedInReservations = reservations.filter(r => r.status === 'checked_in');
  const registeredReservations = reservations.filter(r => r.status !== 'checked_in');

  const handleShare = (action) => {
    const url = window.location.href;
    const text = `Join me at ${selected?.title} — ${selected?.date} @ ${selected?.venue}!`;
    if (action === 'copy') { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    if (action === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    if (action === 'linkedin') window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    setShareOpen(false);
  };

  if (loading) {
    return (
      <div className="main-feed" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading meetups…</div>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="main-feed">
        <div className="page-header">
          <div className="page-header-inner">
            <Link to="/meetups" className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', marginLeft: -8, color: 'var(--text-secondary)' }}>
              <ChevronLeft size={18} /> Back to Events
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', gap: 16, textAlign: 'center' }}>
          <Calendar size={48} color="var(--border-strong)" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>Meetup not found</div>
          <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', maxWidth: 400 }}>
            This event may have been removed or the link is invalid.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="main-feed" style={{ overflowY: 'auto' }}>
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-inner" style={{ padding: '0 24px' }}>
            <Link to="/meetups" className="btn btn-ghost" style={{ padding: '8px', marginLeft: -8, color: 'var(--text-secondary)', gap: 6 }}>
              <ChevronLeft size={20} /> Back to Directory
            </Link>
          </div>
        </div>

        <div style={{ padding: '24px' }}>

          {/* Event Banner */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, marginBottom: 24, padding: '24px', display: 'flex', gap: '36px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Banner image if available */}
            {selected.banner_url && (
              <img src={selected.banner_url} alt={selected.title} style={{ width: '100%', maxWidth: '340px', borderRadius: 16, objectFit: 'contain', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Tickets</div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1.1, margin: 0 }}>
                  {selected.title}
                </h1>

                {/* Share button */}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShareOpen(o => !o)} className="btn btn-secondary btn-sm" style={{ borderRadius: '50%', padding: 8, width: 36, height: 36, justifyContent: 'center', background: 'var(--bg-elevated)' }}>
                    <Share2 size={16} />
                  </button>
                  {shareOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 8, background: 'var(--bg-card)', border: '1px solid var(--border-medium)', borderRadius: 12, padding: 8, boxShadow: 'var(--shadow-lg)', zIndex: 100, minWidth: 180 }}>
                      {[
                        { a: 'copy', label: copied ? '✓ Copied!' : 'Copy Link' },
                        { a: 'whatsapp', label: 'WhatsApp' },
                        { a: 'linkedin', label: 'LinkedIn' },
                      ].map(({ a, label }) => (
                        <button key={a} onClick={() => handleShare(a)} style={{ display: 'flex', width: '100%', background: 'none', border: 'none', padding: '9px 12px', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-primary)', cursor: 'pointer', fontFamily: 'var(--font-sans)', fontWeight: 500, transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        >{label}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 32, maxWidth: '90%' }}>
                {selected.description}
              </p>

              {/* Info cards row */}
              <div className="meetup-info-cards" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                {[
                  { icon: Calendar, label: 'Date', value: selected.date },
                  { icon: Clock, label: 'Time', value: selected.time },
                  { icon: MapPin, label: 'Venue', value: selected.venue },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ flex: 1, minWidth: 180, display: 'flex', gap: 16, alignItems: 'center', padding: '16px', background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Icon size={20} color="var(--primary)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content grid: About + Attendees */}
          <div className="meetups-content-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, alignItems: 'start' }}>

            {/* About + CTA */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 16 }}>
                About {selected.title}
              </h2>
              <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                <p style={{ marginBottom: 12 }}>
                  Welcome to the <strong style={{ color: 'var(--text-primary)' }}>EBC Community</strong> — Hyderabad's premier network connecting founders, creators, engineers, operators, and startup builders.
                </p>
                <p style={{ marginBottom: 16 }}>Our monthly meetups are outcome-driven professional gatherings designed to help you find co-founders, advisors, beta testers, and business partners.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { emoji: '→', title: 'Curated Networking', desc: 'Meet builders actively working in AI, Web3, and SaaS.' },
                    { emoji: '→', title: 'Open Mic Pitch', desc: '1-minute slot for anyone to introduce themselves and what they\'re building.' },
                    { emoji: '→', title: 'Breakfast Included', desc: 'Included with your pass to fuel morning conversations.' },
                  ].map(({ emoji, title, desc }) => (
                    <div key={title} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 12 }}>
                      <span style={{ fontSize: '1.1rem' }}>{emoji}</span>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>{title}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Attendees */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
                  Event Directory
                </h2>
                <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8125rem', padding: '4px 12px', borderRadius: 999 }}>
                  {totalAttendees}
                </span>
              </div>

              {/* Tabs for Checked-in and Registered */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20, gap: 16 }}>
                <button
                  onClick={() => setAttendeeTab('checked_in')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 4px 12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: attendeeTab === 'checked_in' ? 'var(--primary)' : 'var(--text-secondary)',
                    borderBottom: attendeeTab === 'checked_in' ? '2px solid var(--primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  Checked In ({checkedInReservations.length})
                </button>
                <button
                  onClick={() => setAttendeeTab('registered')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '8px 4px 12px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: attendeeTab === 'registered' ? 'var(--primary)' : 'var(--text-secondary)',
                    borderBottom: attendeeTab === 'registered' ? '2px solid var(--primary)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  Registered ({registeredReservations.length})
                </button>
              </div>

              {reservations.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                  No attendees yet. Be the first!
                </div>
              ) : (
                <div style={{ maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
                  {attendeeTab === 'checked_in' ? (
                    checkedInReservations.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                        No attendees checked in yet. Check-ins open at the venue.
                      </div>
                    ) : (
                      checkedInReservations.map(r => <CheckedInAttendeeCard key={r.id} reservation={r} />)
                    )
                  ) : (
                    registeredReservations.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                        No other registered attendees.
                      </div>
                    ) : (
                      registeredReservations.map(r => <AttendeeRow key={r.id} reservation={r} />)
                    )
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Spacer so page content doesn't hide under fixed capsule */}
        <div style={{ height: 'calc(96px + env(safe-area-inset-bottom, 0px))' }} />
      </div>

      <RegistrationCapsule 
        meetup={selected} 
        status={userStatus} 
        remaining={remaining} 
        onAction={handleCapsuleAction} 
      />

      {/* Registration Modal */}
      {showModal && (
        <RegisterModal
          meetup={{ ...selected, remaining }}
          session={session}
          onClose={() => setShowModal(false)}
          onSuccess={() => { loadReservations(); loadUserReservation(); }}
          initialPendingRecord={userStatus === 'PENDING' ? userReservation : null}
        />
      )}

      {/* Pass Modal */}
      {showPassModal && userReservation && (
        <PassModal 
          ticket={userReservation} 
          meetup={selected} 
          onClose={() => setShowPassModal(false)} 
        />
      )}
    </>
  );
}

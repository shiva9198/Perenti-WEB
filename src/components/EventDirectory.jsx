import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function CheckedInAttendeeCard({ reservation }) {
  const initials = (reservation.user_name || reservation.user_email || '?').charAt(0).toUpperCase();

  let answersObj = {};
  try {
    answersObj = JSON.parse(reservation.answers || '{}');
  } catch (e) {
    answersObj = {};
  }

  const safeEmail = (reservation.user_email || '').trim();

  return (
    <Link to={`/profile/${encodeURIComponent(safeEmail)}`} state={{ reservation }} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '16px',
        marginBottom: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        cursor: 'pointer'
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
    </Link>
  );
}

export function AttendeeRow({ reservation }) {
  const initials = (reservation.user_name || reservation.user_email || '?').charAt(0).toUpperCase();
  const safeEmail = (reservation.user_email || '').trim();
  return (
    <Link to={`/profile/${encodeURIComponent(safeEmail)}`} state={{ reservation }} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
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
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', padding: '4px 10px', background: 'var(--bg-elevated)', borderRadius: 999 }}>
          {reservation.quantity} pass{reservation.quantity > 1 ? 'es' : ''}
        </div>
      </div>
    </Link>
  );
}

export default function EventDirectory({ reservations }) {
  const [attendeeTab, setAttendeeTab] = useState('checked_in');

  const checkedInReservations = reservations.filter(r => r.status === 'checked_in');
  const registeredReservations = reservations.filter(r => r.status !== 'checked_in');
  
  const totalAttendees = reservations.reduce((acc, curr) => acc + (curr.quantity || 1), 0);

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-primary)', margin: 0 }}>
          Event Directory
        </h2>
        <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8125rem', padding: '4px 12px', borderRadius: 999 }}>
          {totalAttendees}
        </span>
      </div>

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
  );
}

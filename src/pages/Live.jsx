import React, { useState, useEffect } from 'react';
import { fetchMeetups, fetchReservations } from '../services/api';
import { CheckedInAttendeeCard, AttendeeRow } from '../components/EventDirectory';
import { Lock, Radio } from 'lucide-react';
import { parseMeetupTimes } from '../utils/dateHelpers';

export default function Live({ currentUser }) {
  const [activeMeetup, setActiveMeetup] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    async function loadLiveEvent() {
      if (!currentUser?.email) {
        setLoading(false);
        return;
      }

      try {
        const allMeetups = await fetchMeetups();
        const active = allMeetups.find(m => {
          if (!m.is_active) return false;
          const { end } = parseMeetupTimes(m.date, m.time);
          // Auto-close event when the event time is ended
          return Date.now() <= end.getTime();
        });

        if (!active) {
          setLoading(false);
          return;
        }

        setActiveMeetup(active);

        const resList = await fetchReservations(active.id);
        setReservations(Array.isArray(resList) ? resList : []);
      } catch (err) {
        console.error('Failed to load live event:', err);
      } finally {
        setLoading(false);
      }
    }

    loadLiveEvent();
  }, [currentUser]);

  // Tick every second to update the countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Handle Loading & No Active Event States
  if (loading) {
    return (
      <div className="main-feed" style={{ padding: 48, textAlign: 'center', minHeight: '100dvh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading live event...</p>
      </div>
    );
  }

  if (!activeMeetup) {
    return (
      <div className="main-feed" style={{ padding: 48, textAlign: 'center', minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <Radio size={32} color="var(--text-tertiary)" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: 8, color: 'var(--text-primary)' }}>No Live Events</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>
          There is no active event right now. The live directory will be available here during our next meetup.
        </p>
      </div>
    );
  }

  // Calculate Event Status
  const { start: eventStartTime } = parseMeetupTimes(activeMeetup.date, activeMeetup.time);
  const timeLeft = eventStartTime.getTime() - now;
  const isEventStarted = timeLeft <= 0;

  // Countdown logic
  const d = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const h = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const m = Math.floor((timeLeft / 1000 / 60) % 60);
  const s = Math.floor((timeLeft / 1000) % 60);

  // Split reservations
  const checkedInReservations = reservations.filter(r => r.status === 'checked_in');
  const registeredReservations = reservations.filter(r => r.status !== 'checked_in');

  return (
    <div className="main-feed" style={{ padding: '24px 16px', minHeight: '100dvh', paddingBottom: 100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, paddingLeft: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-glow)', border: '1px solid rgba(3,212,124,0.2)' }}>
          <Radio size={18} color="var(--primary)" />
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{activeMeetup.title}</h1>
          <div style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>Live Event Directory</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        
        {/* Checked In Section */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>
              Checked In
            </h2>
            <span style={{ background: 'var(--primary-glow)', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8125rem', padding: '4px 12px', borderRadius: 999 }}>
              {isEventStarted ? checkedInReservations.length : <Lock size={12} style={{ display: 'inline', marginTop: -2 }} />}
            </span>
          </div>

          {!isEventStarted ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', background: 'var(--bg-elevated)', borderRadius: 12, border: '1px dashed var(--border)' }}>
              <Lock size={24} color="var(--text-tertiary)" style={{ marginBottom: 12 }} />
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 }}>Check-ins are locked</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                This section will unlock at {activeMeetup.time.split(/[-–]/)[0].trim()} on the day of the event.
              </div>
              <div style={{ marginTop: 24, padding: '12px', background: 'var(--bg-card)', borderRadius: 12, display: 'inline-block' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-tertiary)', marginBottom: 4, fontWeight: 700 }}>Unlocks In</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 800 }}>
                  {d > 0 && `${d}d `}{h > 0 && `${h}h `}{m}m {s}s
                </div>
              </div>
            </div>
          ) : checkedInReservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              No one has checked in yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {checkedInReservations.map(r => <CheckedInAttendeeCard key={r.id} reservation={r} />)}
            </div>
          )}
        </div>

        {/* Registered Section */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>
              Registered
            </h2>
            <span style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.8125rem', padding: '4px 12px', borderRadius: 999 }}>
              {registeredReservations.length}
            </span>
          </div>

          {registeredReservations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              No other registered attendees.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {registeredReservations.map(r => <AttendeeRow key={r.id} reservation={r} />)}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

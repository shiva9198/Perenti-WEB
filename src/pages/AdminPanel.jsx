import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Calendar, Clock, MapPin, Users, Edit2, Trash2, CheckCircle, XCircle, Eye, EyeOff, Camera, Clock3, MessageCircle, Search, Check, X } from 'lucide-react';
import { fetchMeetups, fetchReservations, updateReservationStatus, scanTicket, fetchPendingApprovals, approveReservation, rejectReservation } from '../services/api';
import CountdownTimer, { useCountdown } from '../components/CountdownTimer';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ebc-app-backend.onrender.com';
const apiClient = axios.create({ baseURL: `${API_BASE}/api`, headers: { 'Content-Type': 'application/json' } });

// Admin emails — anyone in this list gets admin access
const ADMIN_EMAILS = ['admin@perenti.com', 'sreemadhav@gmail.com', 'madhav@ebc.com', 'shiva24.santosh@gmail.com'];

function StatCard({ label, value, color = 'var(--primary)' }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: '20px 24px' }}>
      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color, letterSpacing: '-0.03em' }}>{value}</div>
    </div>
  );
}

function MeetupForm({ onSave, initial, onCancel }) {
  const [form, setForm] = useState(initial || {
    title: '', description: '', rawDate: '', startTime: '', endTime: '', venue: '', banner_url: '', capacity: 60, is_active: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ebc_avatars');

      const res = await axios.post('https://api.cloudinary.com/v1_1/dcemw61tu/image/upload', formData);
      setForm(f => ({ ...f, banner_url: res.data.secure_url }));
    } catch (err) {
      setError('Failed to upload image. Please check size/format.');
    } finally {
      setUploadingImage(false);
    }
  };

  const getFormattedDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = d.toLocaleDateString('en-US', { month: 'long' });
    const dNum = parseInt(day);
    const suffix = ["th", "st", "nd", "rd"][((dNum % 100) - 20) % 10] || ["th", "st", "nd", "rd"][dNum % 100] || "th";
    return `${weekday}, ${monthName} ${dNum}${suffix} ${year}`;
  };

  const formatAMPM = (timeStr) => {
    let [hours, minutes] = timeStr.split(':');
    hours = parseInt(hours);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (initial?.id) {
        // Update — not in backend yet, inform user
        setError('Edit is not yet supported via API. Delete and re-add.');
        setSaving(false);
        return;
      }

      const finalDate = form.rawDate ? getFormattedDate(form.rawDate) : form.date;
      const finalTime = (form.startTime && form.endTime) ? `${formatAMPM(form.startTime)} – ${formatAMPM(form.endTime)} (IST)` : form.time;

      await apiClient.post('/meetups', { 
        ...form, 
        date: finalDate, 
        time: finalTime, 
        capacity: parseInt(form.capacity) || 60 
      });
      onSave();
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to save meetup.');
      setSaving(false);
    }
  };

  const inputSt = { width: '100%', padding: '11px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.9rem', color: 'var(--text-primary)', outline: 'none', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Event Title *</label>
          <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="EBC 29th Meetup" style={inputSt} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Capacity</label>
          <input type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} min={1} max={500} style={inputSt} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Date *</label>
          <input type="date" required value={form.rawDate} onChange={e => set('rawDate', e.target.value)} style={inputSt} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Time *</label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input type="time" required value={form.startTime} onChange={e => set('startTime', e.target.value)} style={inputSt} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            <span style={{ alignSelf: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600 }}>to</span>
            <input type="time" required value={form.endTime} onChange={e => set('endTime', e.target.value)} style={inputSt} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
          </div>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Venue *</label>
        <input required value={form.venue} onChange={e => set('venue', e.target.value)} placeholder="Birch Cafe Vanasthalipuram, Hyderabad" style={inputSt} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Banner Image</label>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploadingImage}
            style={{ flex: 1, ...inputSt, padding: '8px 14px' }}
          />
          <input
            value={form.banner_url}
            onChange={e => set('banner_url', e.target.value)}
            placeholder="...or paste URL here"
            style={{ flex: 2, ...inputSt }}
            onFocus={e => e.target.style.borderColor = 'var(--primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        {uploadingImage && <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: 6, fontWeight: 500 }}>Uploading image to Cloudinary...</div>}
        {form.banner_url && !uploadingImage && (
          <img src={form.banner_url} alt="Preview" style={{ marginTop: 10, height: 100, borderRadius: 8, objectFit: 'cover' }} />
        )}
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="What will attendees experience?" style={{ ...inputSt, resize: 'vertical' }} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'var(--border)'} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
        <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', flex: 1 }}>Active (visible to users)</label>
        <div onClick={() => set('is_active', !form.is_active)} style={{ width: 44, height: 24, borderRadius: 999, background: form.is_active ? 'var(--primary)' : 'var(--border-strong)', cursor: 'pointer', position: 'relative', transition: 'all 0.25s' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: form.is_active ? 23 : 3, transition: 'all 0.25s' }} />
        </div>
      </div>

      {error && <div style={{ background: 'rgba(242,87,48,0.08)', border: '1px solid rgba(242,87,48,0.3)', borderRadius: 10, padding: '12px 14px', fontSize: '0.875rem', color: 'var(--red)' }}>{error}</div>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button type="button" onClick={onCancel} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
        <button type="submit" disabled={saving || uploadingImage} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', opacity: saving || uploadingImage ? 0.7 : 1 }}>
          {saving ? 'Saving…' : 'Create Meetup'}
        </button>
      </div>
    </form>
  );
}

function MeetupAdminCard({ meetup, onRefresh, onScanClick }) {
  const [reservations, setReservations] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeQr, setActiveQr] = useState(null);

  const totalAttendees = reservations.reduce((s, r) => s + (r.quantity || 1), 0);

  const loadReservations = () => {
    fetchReservations(meetup.id).then(r => setReservations(Array.isArray(r) ? r : []));
  };

  useEffect(() => {
    loadReservations();
  }, [meetup.id]);

  const handleCheckIn = async (reservationId) => {
    try {
      await updateReservationStatus(reservationId, 'checked_in');
      loadReservations();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to check in user: ' + (err?.response?.data?.detail || err?.message || err));
    }
  };

  const handleCheckOut = async (reservationId) => {
    try {
      await updateReservationStatus(reservationId, 'confirmed');
      loadReservations();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Failed to uncheck user: ' + (err?.response?.data?.detail || err?.message || err));
    }
  };

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
      {meetup.banner_url && meetup.banner_url.trim() !== '' && (
        <img src={meetup.banner_url} alt={meetup.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
      )}
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{meetup.title}</span>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 8px', borderRadius: 999, background: meetup.is_active ? 'var(--primary-glow)' : 'var(--bg-elevated)', color: meetup.is_active ? 'var(--primary)' : 'var(--text-tertiary)', border: `1px solid ${meetup.is_active ? 'rgba(3,212,124,0.2)' : 'var(--border)'}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {meetup.is_active ? 'Active' : 'Hidden'}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span>📅 {meetup.date}</span>
              <span>⏰ {meetup.time}</span>
              <span>📍 {meetup.venue}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--primary)', lineHeight: 1 }}>{totalAttendees}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>/ {meetup.capacity} seats</div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 999, background: 'var(--bg-elevated)', marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 999, background: 'var(--primary)', width: `${Math.min(100, (totalAttendees / (meetup.capacity || 1)) * 100)}%`, transition: 'width 0.5s ease' }} />
        </div>

        {/* Actions row */}
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
          <button onClick={() => setExpanded(e => !e)} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0' }}>
            <Users size={14} />
            {expanded ? 'Hide' : 'Show'} {reservations.length} registration{reservations.length !== 1 ? 's' : ''}
          </button>

          <button
            onClick={() => onScanClick(meetup.id, meetup.title)}
            className="btn btn-ghost btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', color: 'var(--primary)', fontWeight: 600 }}
          >
            <Camera size={14} />
            Scan QR Check-In
          </button>
        </div>

        {expanded && (
          <div style={{ marginTop: 12, maxHeight: 400, overflowY: 'auto', overflowX: 'auto' }}>
            {reservations.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.875rem', padding: '20px 0' }}>No registrations yet.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', minWidth: 550 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Attendee & Q&A</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Email</th>
                    <th style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Passes</th>
                    <th style={{ textAlign: 'left', padding: '8px 4px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Ticket ID / QR</th>
                    <th style={{ textAlign: 'center', padding: '8px 4px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Status</th>
                    <th style={{ textAlign: 'right', padding: '8px 4px', color: 'var(--text-tertiary)', fontWeight: 600 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map(r => {
                    let answersObj = {};
                    try {
                      answersObj = JSON.parse(r.answers || '{}');
                    } catch (e) {
                      answersObj = {};
                    }
                    const hasAnswers = answersObj.role || answersObj.building || answersObj.lookingFor;

                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 4px', fontWeight: 600, color: 'var(--text-primary)', verticalAlign: 'top' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.user_name || '—'}</div>
                          {hasAnswers ? (
                            <div style={{
                              fontSize: '0.725rem',
                              color: 'var(--text-secondary)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                              background: 'var(--bg-elevated)',
                              padding: '6px 10px',
                              borderRadius: 8,
                              marginTop: 6,
                              fontWeight: 'normal',
                              border: '1px solid var(--border-medium)',
                              maxWidth: 240
                            }}>
                              {answersObj.role && <div><span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>Role:</span> {answersObj.role}</div>}
                              {answersObj.building && <div><span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>Building:</span> {answersObj.building}</div>}
                              {answersObj.lookingFor && <div><span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>Looking for:</span> {answersObj.lookingFor}</div>}
                            </div>
                          ) : null}
                        </td>
                        <td style={{ padding: '12px 4px', color: 'var(--text-secondary)', verticalAlign: 'top' }}>{r.user_email}</td>
                        <td style={{ padding: '12px 4px', textAlign: 'center', color: 'var(--primary)', fontWeight: 700, verticalAlign: 'top' }}>{r.quantity}</td>
                        <td style={{ padding: '12px 4px', verticalAlign: 'top', position: 'relative' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${r.ticket_id}`}
                                alt="QR Code"
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 6,
                                  cursor: 'pointer',
                                  border: '1px solid var(--border-medium)',
                                  background: '#fff',
                                  display: 'block'
                                }}
                                title="Click to expand QR code"
                                onClick={() => setActiveQr(activeQr === r.ticket_id ? null : r.ticket_id)}
                              />
                              <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-primary)' }}>{r.ticket_id}</span>
                            </div>
                            {activeQr === r.ticket_id && (
                              <div style={{
                                background: '#fff',
                                padding: 8,
                                borderRadius: 10,
                                border: '1px solid var(--border)',
                                position: 'absolute',
                                zIndex: 100,
                                boxShadow: 'var(--shadow-md)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 6,
                                top: 40,
                                left: 0
                              }}>
                                <img
                                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${r.ticket_id}`}
                                  alt="QR Code Expanded"
                                  width="120"
                                  height="120"
                                />
                                <button
                                  onClick={(e) => { e.stopPropagation(); setActiveQr(null); }}
                                  style={{
                                    fontSize: '0.65rem',
                                    padding: '2px 8px',
                                    border: 'none',
                                    background: 'var(--bg-elevated)',
                                    borderRadius: 4,
                                    cursor: 'pointer',
                                    color: 'var(--text-primary)',
                                    fontWeight: 600
                                  }}
                                >
                                  Close
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 4px', textAlign: 'center', verticalAlign: 'top' }}>
                          <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 999,
                            background: r.status === 'checked_in' ? 'rgba(3,212,124,0.1)' : 'var(--primary-glow)',
                            color: r.status === 'checked_in' ? '#03d47c' : 'var(--primary)',
                            textTransform: 'uppercase',
                            border: `1px solid ${r.status === 'checked_in' ? 'rgba(3,212,124,0.2)' : 'rgba(3,212,124,0.1)'}`
                          }}>
                            {r.status === 'checked_in' ? 'checked in' : r.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 4px', textAlign: 'right', verticalAlign: 'top' }}>
                          {r.status !== 'checked_in' ? (
                            <button
                              onClick={() => handleCheckIn(r.id)}
                              className="btn btn-primary"
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.7rem',
                                borderRadius: 6,
                                minHeight: 'auto',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                textTransform: 'none',
                                fontWeight: 600
                              }}
                            >
                              Check In
                            </button>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                              <span style={{ fontSize: '0.7rem', color: '#03d47c', display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                                <CheckCircle size={12} /> Checked In
                              </span>
                              <button
                                onClick={() => handleCheckOut(r.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--red)',
                                  fontSize: '0.65rem',
                                  cursor: 'pointer',
                                  padding: '2px 0',
                                  textDecoration: 'underline',
                                  fontWeight: 500,
                                  outline: 'none'
                                }}
                              >
                                Uncheck
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TicketScanner({ scanMeetupId, scanMeetupTitle, onClearFilter }) {
  const [action, setAction] = useState('check_in'); // 'check_in' | 'check_out'
  const [manualId, setManualId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { success: bool, message: str, name: str, event: str, isWrongEvent: bool }
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  const qrCodeRef = useRef(null);
  const scannerId = "admin-qr-reader";

  const handleScanSuccess = async (decodedText) => {
    stopScan();
    await processTicket(decodedText);
  };

  const processTicket = async (ticketId) => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await scanTicket(ticketId, action);
      if (res.status === 'success') {
        const isWrongEvent = scanMeetupId && res.reservation?.meetup_id !== scanMeetupId;

        setResult({
          success: true,
          message: isWrongEvent
            ? `Warning: Checked in, but pass belongs to another event!`
            : res.message,
          name: res.reservation?.user_name || 'Attendee',
          event: res.meetup?.title || 'Meetup',
          ticketId: ticketId,
          status: res.reservation?.status,
          isWrongEvent: !!isWrongEvent
        });
        setManualId('');
      } else {
        setError(res.message || 'Verification failed');
      }
    } catch (err) {
      setError(err?.response?.data?.detail || err?.message || 'Failed to verify ticket ID.');
    } finally {
      setLoading(false);
    }
  };

  const startScan = async () => {
    setError('');
    setResult(null);
    if (qrCodeRef.current && qrCodeRef.current.isScanning) {
      try {
        await qrCodeRef.current.stop();
      } catch (e) {
        console.error("Error stopping scanner before restart:", e);
      }
    }
    try {
      setTimeout(async () => {
        try {
          const html5QrCode = new Html5Qrcode(scannerId);
          qrCodeRef.current = html5QrCode;
          setScanning(true);
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: (width, height) => {
                const min = Math.min(width, height);
                const boxWidth = Math.floor(min * 0.7);
                return { width: boxWidth, height: boxWidth };
              }
            },
            handleScanSuccess,
            (errorMessage) => { }
          );
        } catch (scanErr) {
          setError("Camera start failed: " + scanErr.message);
          setScanning(false);
        }
      }, 150);
    } catch (err) {
      setError("Camera access error: " + err.message);
      setScanning(false);
    }
  };

  const stopScan = async () => {
    if (qrCodeRef.current && qrCodeRef.current.isScanning) {
      try {
        await qrCodeRef.current.stop();
        setScanning(false);
      } catch (err) {
        console.error("Failed to stop scanner", err);
      }
    }
  };

  useEffect(() => {
    setAction('check_in');
    startScan();
    return () => {
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        qrCodeRef.current.stop().catch(err => console.error(err));
      }
    };
  }, [scanMeetupId]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    processTicket(manualId.trim().toUpperCase());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 480, margin: '12px auto 0', width: '100%' }}>
      {/* Meetup Filter Banner */}
      {scanMeetupId && (
        <div style={{
          background: 'var(--primary-glow)',
          border: '1px solid rgba(3,212,124,0.2)',
          borderRadius: 14,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10
        }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            🎯 Scanning for: <strong>{scanMeetupTitle}</strong>
          </div>
          <button
            onClick={onClearFilter}
            style={{
              border: 'none',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Direction Action Segment */}
      <div style={{ display: 'flex', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: 4 }}>
        <button
          type="button"
          onClick={() => { setAction('check_in'); setResult(null); }}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 8, border: 'none',
            background: action === 'check_in' ? 'var(--primary)' : 'transparent',
            color: action === 'check_in' ? '#061B0F' : 'var(--text-secondary)',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Check In
        </button>
        <button
          type="button"
          onClick={() => { setAction('check_out'); setResult(null); }}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 8, border: 'none',
            background: action === 'check_out' ? 'var(--primary)' : 'transparent',
            color: action === 'check_out' ? '#061B0F' : 'var(--text-secondary)',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          Check Out
        </button>
      </div>

      {/* Result Display Card */}
      {result && (
        <div style={{
          background: result.isWrongEvent ? 'rgba(242,87,48,0.06)' : 'rgba(3,212,124,0.06)',
          border: `1.5px solid ${result.isWrongEvent ? 'var(--red)' : '#03d47c'}`,
          borderRadius: 16,
          padding: 20,
          textAlign: 'center',
          animation: 'fadeInUp 0.3s ease'
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: result.isWrongEvent ? 'rgba(242,87,48,0.15)' : 'rgba(3,212,124,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            color: result.isWrongEvent ? 'var(--red)' : '#03d47c'
          }}>
            {result.isWrongEvent ? <XCircle size={28} style={{ margin: 'auto' }} /> : <CheckCircle size={28} style={{ margin: 'auto' }} />}
          </div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 4 }}>
            {result.message}
          </h4>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            <strong>{result.name}</strong> has been updated.
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Ticket Event: {result.event}
          </div>
          {result.isWrongEvent && (
            <div style={{ fontSize: '0.75rem', color: 'var(--red)', fontWeight: 700, marginTop: 4 }}>
              Active scanning session is restricted to: "{scanMeetupTitle}"
            </div>
          )}
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontFamily: 'monospace', marginTop: 4 }}>
            ID: {result.ticketId}
          </div>
          <button
            onClick={() => { setResult(null); startScan(); }}
            className="btn btn-primary btn-sm"
            style={{ marginTop: 16, width: '100%', justifyContent: 'center' }}
          >
            Scan Next Pass
          </button>
        </div>
      )}

      {/* Error Display Card */}
      {error && (
        <div style={{
          background: 'rgba(242,87,48,0.06)',
          border: '1.5px solid var(--red)',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center',
          animation: 'fadeInUp 0.3s ease'
        }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(242,87,48,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: 'var(--red)' }}>
            <XCircle size={28} style={{ margin: 'auto' }} />
          </div>
          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 8 }}>
            Verification Failed
          </h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => { setError(''); startScan(); }}
              className="btn btn-primary btn-sm"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Retry Camera Scan
            </button>
            <button
              onClick={() => setError('')}
              className="btn btn-secondary btn-sm"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* QR Video Container */}
      {!result && !error && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 20,
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: 'var(--text-primary)' }}>
            <Camera size={16} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Pass QR Scanner</span>
          </div>

          <div
            id={scannerId}
            style={{
              width: '100%',
              background: '#000',
              borderRadius: 12,
              overflow: 'hidden',
              aspectRatio: '1/1',
              maxHeight: 280,
              maxWidth: 280,
              display: scanning ? 'block' : 'none'
            }}
          />

          {!scanning && (
            <div style={{
              width: '100%',
              aspectRatio: '1/1',
              maxHeight: 280,
              maxWidth: 280,
              background: 'var(--bg-elevated)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1.5px dashed var(--border-strong)',
              marginBottom: 16
            }}>
              <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: 20 }}>
                <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: 10 }}>📷</span>
                <span style={{ fontSize: '0.8rem' }}>Camera scanner is offline</span>
              </div>
            </div>
          )}

          <div style={{ width: '100%', marginTop: 16 }}>
            {scanning ? (
              <button
                type="button"
                onClick={stopScan}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Stop Camera Scan
              </button>
            ) : (
              <button
                type="button"
                onClick={startScan}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Start Camera Scan
              </button>
            )}
          </div>
        </div>
      )}

      {/* Manual Code Input Form */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: 20,
        boxShadow: 'var(--shadow-sm)',
        marginBottom: 20
      }}>
        <form onSubmit={handleManualSubmit}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Manual Ticket ID Verification
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              placeholder="e.g. PRNT-EBC-ABC123"
              value={manualId}
              onChange={e => setManualId(e.target.value)}
              style={{
                flex: 1, padding: '10px 14px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, fontSize: '0.9rem', color: 'var(--text-primary)', outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !manualId.trim()}
              className="btn btn-primary"
              style={{ padding: '0 16px', minHeight: 'auto' }}
            >
              {loading ? '...' : 'Verify'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Pending Approvals Tab ───────────────────────────────────────────────────
function PendingApprovalsTab({ session }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nameQuery, setNameQuery] = useState('');
  const [eventQuery, setEventQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'expired'
  const [actioning, setActioning] = useState(null); // id of the item being approved/rejected
  const adminEmail = session?.email || '';

  const load = useCallback(async () => {
    const data = await fetchPendingApprovals(adminEmail);
    setItems(data);
    setLoading(false);
  }, [adminEmail]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // auto-poll every 30s
    return () => clearInterval(interval);
  }, [load]);

  const handleApprove = async (id) => {
    setActioning(id);
    try {
      await approveReservation(id, adminEmail);
      await load();
    } catch (err) {
      alert('Approval failed: ' + (err?.response?.data?.detail || err?.message));
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this registration? The user will need to re-register.')) return;
    setActioning(id);
    try {
      await rejectReservation(id, adminEmail);
      await load();
    } catch (err) {
      alert('Rejection failed: ' + (err?.response?.data?.detail || err?.message));
    } finally {
      setActioning(null);
    }
  };

  // Client-side filtering
  const filtered = items.filter(r => {
    const nameMatch = !nameQuery || (r.user_name || '').toLowerCase().includes(nameQuery.toLowerCase());
    const eventMatch = !eventQuery || (r.meetup?.title || '').toLowerCase().includes(eventQuery.toLowerCase());
    const isExpired = r.expires_at && new Date(r.expires_at) <= new Date();
    const statusMatch =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && !isExpired && r.status === 'pending_payment') ||
      (statusFilter === 'expired' && (isExpired || r.status === 'expired' || r.status === 'rejected'));
    return nameMatch && eventMatch && statusMatch;
  });

  const pendingCount = items.filter(r =>
    r.status === 'pending_payment' && r.expires_at && new Date(r.expires_at) > new Date()
  ).length;

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-secondary)' }}>Loading approvals…</div>;
  }

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Pending" value={pendingCount} color="var(--orange, #FF7101)" />
        <StatCard label="Total in Queue" value={items.length} />
      </div>

      {/* Search + Filter bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input value={nameQuery} onChange={e => setNameQuery(e.target.value)} placeholder="Search by name…" style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit' }} />
        </div>
        <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input value={eventQuery} onChange={e => setEventQuery(e.target.value)} placeholder="Search by event…" style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.875rem', color: 'var(--text-primary)', width: '100%', fontFamily: 'inherit' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'pending', 'expired'].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)} className={`filter-chip ${statusFilter === f ? 'active' : ''}`}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button onClick={load} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>Refresh</button>
      </div>

      {/* Queue */}
      {filtered.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '2px dashed var(--border-medium)', borderRadius: 20, padding: '48px 24px', textAlign: 'center' }}>
          <CheckCircle size={40} color="var(--primary)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: 8 }}>All clear</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No pending approvals matching your filters.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(r => {
            const isExpired = r.expires_at && new Date(r.expires_at) <= new Date();
            const isRejected = r.status === 'rejected';
            const isActioning = actioning === r.id;
            const isClosed = isExpired || isRejected;

            return (
              <div key={r.id} style={{ background: 'var(--bg-card)', borderRadius: 16, border: `1.5px solid ${isClosed ? 'var(--border)' : 'rgba(255,113,1,0.3)'}`, overflow: 'hidden', opacity: isClosed ? 0.7 : 1 }}>
                {/* Card header */}
                <div style={{ padding: '12px 20px', background: isClosed ? 'var(--bg-elevated)' : 'rgba(255,113,1,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{r.user_name || '—'}</div>
                  {isClosed ? (
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(242,87,48,0.1)', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {isRejected ? 'Rejected' : 'Expired'}
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'rgba(255,113,1,0.15)', color: 'var(--orange, #FF7101)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending</span>
                  )}
                </div>

                {/* Card body */}
                <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.875rem' }}>
                    <div><span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Event: </span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{r.meetup?.title || r.meetup_id}</span></div>
                    <div><span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Passes: </span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{r.quantity}</span></div>
                    <div><span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>Email: </span><span style={{ color: 'var(--text-secondary)' }}>{r.user_email}</span></div>
                  </div>

                  {r.expires_at && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8125rem' }}>
                      <Clock3 size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                      {isClosed ? (
                        <span style={{ color: 'var(--text-tertiary)' }}>Expired</span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>Expires in <CountdownTimer expiresAt={r.expires_at} style={{ display: 'inline' }} /></span>
                      )}
                    </div>
                  )}

                  {r.created_at && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Submitted: {new Date(r.created_at).toLocaleString()}</div>
                  )}

                  {/* Action buttons — only show for non-closed items */}
                  {!isClosed && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
                      <button
                        onClick={() => handleApprove(r.id)}
                        disabled={isActioning}
                        className="btn btn-sm"
                        style={{ background: 'var(--primary)', color: 'var(--bg)', flex: 1, justifyContent: 'center', opacity: isActioning ? 0.6 : 1 }}
                      >
                        <Check size={14} /> {isActioning ? 'Approving…' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        disabled={isActioning}
                        className="btn btn-sm btn-secondary"
                        style={{ color: 'var(--red)', borderColor: 'rgba(242,87,48,0.3)', flex: 1, justifyContent: 'center', opacity: isActioning ? 0.6 : 1 }}
                      >
                        <X size={14} /> {isActioning ? 'Rejecting…' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminPanel({ session }) {
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('meetups'); // 'meetups' | 'scan' | 'approvals'
  const [scanMeetupId, setScanMeetupId] = useState(null);
  const [scanMeetupTitle, setScanMeetupTitle] = useState('');
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  const isAdmin = session && (ADMIN_EMAILS.includes(session.email) || session.email?.includes('@ebc') || session.email?.includes('@EBC'));

  const load = () => {
    setLoading(true);
    fetchMeetups().then(data => {
      setMeetups(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Poll pending approvals count for badge
  useEffect(() => {
    if (!isAdmin || !session?.email) return;
    const poll = async () => {
      const data = await fetchPendingApprovals(session.email);
      const active = data.filter(r =>
        r.status === 'pending_payment' && r.expires_at && new Date(r.expires_at) > new Date()
      ).length;
      setPendingApprovalsCount(active);
    };
    poll();
    const id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, [isAdmin, session?.email]);

  if (!isAdmin) {
    return (
      <div className="main-feed" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16, textAlign: 'center', padding: 32 }}>
        <XCircle size={48} color="var(--red)" />
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>Access Denied</div>
        <div style={{ color: 'var(--text-secondary)', maxWidth: 380 }}>This panel is only available to administrators. Log in with an admin account.</div>
        <div style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: 8 }}>
          Signed in as: <strong>{session?.email || 'Not signed in'}</strong>
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
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>EBC Admin</div>
            <div className="page-title gradient-text">Event Panel</div>
          </div>
          <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={16} /> New Meetup
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 16, padding: '0 24px', marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <button
          onClick={() => setTab('meetups')}
          style={{
            padding: '12px 4px', border: 'none', background: 'transparent',
            borderBottom: `2.5px solid ${tab === 'meetups' ? 'var(--primary)' : 'transparent'}`,
            color: tab === 'meetups' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            transition: 'all 0.15s'
          }}
        >
          Manage Meetups
        </button>
        <button
          onClick={() => setTab('scan')}
          style={{
            padding: '12px 4px', border: 'none', background: 'transparent',
            borderBottom: `2.5px solid ${tab === 'scan' ? 'var(--primary)' : 'transparent'}`,
            color: tab === 'scan' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <Camera size={14} /> Scan Passes
        </button>
        <button
          onClick={() => setTab('approvals')}
          style={{
            padding: '12px 4px', border: 'none', background: 'transparent',
            borderBottom: `2.5px solid ${tab === 'approvals' ? 'var(--primary)' : 'transparent'}`,
            color: tab === 'approvals' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', gap: 6
          }}
        >
          <Clock3 size={14} /> Approvals
          {pendingApprovalsCount > 0 && (
            <span style={{ background: 'var(--orange, #FF7101)', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 999, lineHeight: 1 }}>
              {pendingApprovalsCount}
            </span>
          )}
        </button>
      </div>

      <div style={{ padding: '0 24px 24px' }}>
        {tab === 'meetups' ? (
          <>
            {/* Stats Row */}
            <div className="admin-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
              <StatCard label="Total Meetups" value={meetups.length} />
              <StatCard label="Active Events" value={meetups.filter(m => m.is_active).length} color="var(--primary)" />
              <StatCard label="Total Capacity" value={meetups.reduce((s, m) => s + (m.capacity || 0), 0)} color="var(--blue)" />
            </div>

            {/* New Meetup Form */}
            {showForm && (
              <div style={{ background: 'var(--bg-card)', border: '1.5px solid var(--primary)', borderRadius: 20, padding: '28px', marginBottom: 24 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 20 }}>
                  New Meetup
                </div>
                <MeetupForm
                  onSave={() => { setShowForm(false); load(); }}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            )}

            {/* Meetup Cards */}
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
              All Meetups ({meetups.length})
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>Loading…</div>
            ) : meetups.length === 0 ? (
              <div style={{ background: 'var(--bg-card)', border: '2px dashed var(--border-medium)', borderRadius: 20, padding: '48px', textAlign: 'center' }}>
                <Calendar size={40} color="var(--border-strong)" style={{ margin: '0 auto 16px' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: 8 }}>No meetups yet</div>
                <div style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9375rem' }}>Create your first event using the button above.</div>
                <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                  <Plus size={16} /> Create First Meetup
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {meetups.map(m => (
                  <MeetupAdminCard
                    key={m.id}
                    meetup={m}
                    onRefresh={load}
                    onScanClick={(meetupId, meetupTitle) => {
                      setScanMeetupId(meetupId);
                      setScanMeetupTitle(meetupTitle);
                      setTab('scan');
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : tab === 'approvals' ? (
          <PendingApprovalsTab session={session} />
        ) : (
          <TicketScanner
            scanMeetupId={scanMeetupId}
            scanMeetupTitle={scanMeetupTitle}
            onClearFilter={() => {
              setScanMeetupId(null);
              setScanMeetupTitle('');
            }}
          />
        )}
      </div>

      <div style={{ height: 80 }} />
    </div>
  );
}

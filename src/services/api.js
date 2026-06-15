import axios from 'axios';
import { Client, Account, ID } from 'appwrite';
import { cachedFetch, cacheInvalidateAll, cacheInvalidate } from './cache.js';

// ── REST API (Render backend) ────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://ebc-app-backend.onrender.com';

const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' },
});

// ── Appwrite (Auth) ──────────────────────────────────────────────────────────

const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT  = '6a1e7b87001ddf9d2470';

const appwriteClient = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT);

const account = new Account(appwriteClient);

// ── Auth API ─────────────────────────────────────────────────────────────────

export const loginWithEmail = async (email, password) => {
  await account.createEmailPasswordSession(email, password);
  return await account.get();
};

export const signupWithEmail = async (name, email, password) => {
  await account.create(ID.unique(), email, password, name);
  await account.createEmailPasswordSession(email, password);
  return await account.get();
};

export const getSession = async () => {
  try {
    // Returns { $id, email, name, ... } from Appwrite
    const user = await account.get();
    return user;
  } catch {
    return null;
  }
};

export const logout = async () => {
  try {
    await account.deleteSession('current');
    cacheInvalidateAll(); // clear cached data on logout
  } catch {}
};

// ── Members API ───────────────────────────────────────────────────────────────

export const fetchMembers = async () => {
  return cachedFetch('members', async () => {
    try {
      const res = await apiClient.get('/members');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error('fetchMembers error:', err);
      return [];
    }
  });
};

export const getCurrentUser = async (user) => {
  if (!user || !user.email) return null;
  try {
    const res = await apiClient.get(`/members/me?email=${encodeURIComponent(user.email)}`);
    return res.data;
  } catch (err) {
    if (err?.response?.status === 404) {
      return {
        name: user.name || 'New Member',
        email: user.email,
        profession: '',
        avatar: '',
        needsOnboarding: true
      };
    }
    return { name: user.name || 'New Member', email: user.email, profession: '', avatar: '', needsOnboarding: true };
  }
};

export const createMember = async (memberData) => {
  try {
    const res = await apiClient.post('/members', memberData);
    cacheInvalidate('members'); // Clear cache so directory refreshes
    return res.data;
  } catch (err) {
    console.error('createMember error:', err);
    throw err;
  }
};

export const updateMember = async (email, updateData) => {
  if (!email) throw new Error('Email required to update member');
  try {
    const res = await apiClient.put(`/members/${encodeURIComponent(email)}`, updateData);
    cacheInvalidate('members');
    return res.data;
  } catch (err) {
    console.error('updateMember error:', err);
    throw err;
  }
};

export const isProfileComplete = (user) => {
  if (!user) return false;
  // Maximum information required fields (company is optional)
  const required = ['name', 'profession', 'bio'];
  for (const field of required) {
    if (!user[field] || String(user[field]).trim() === '') return false;
  }
  // Location/area can be in either field
  if ((!user.location || String(user.location).trim() === '') && 
      (!user.area || String(user.area).trim() === '')) {
    return false;
  }
  // Require at least one connection mode
  if ((!user.linkedin || String(user.linkedin).trim() === '') && 
      (!user.instagram || String(user.instagram).trim() === '')) {
    return false;
  }
  return true;
};

// ── Meetups API ───────────────────────────────────────────────────────────────

export const fetchMeetups = async () => {
  return cachedFetch('meetups', async () => {
    try {
      const res = await apiClient.get('/meetups');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error('fetchMeetups error:', err);
      return [];
    }
  });
};

export const createSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/[\s_-]+/g, '-') // Swap spaces for hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens
};

export const fetchMeetup = async (idOrSlug) => {
  try {
    // 1. Try to find the meetup by slug from the cached meetups list first
    const allMeetups = await fetchMeetups();
    const match = allMeetups.find(m => m.id === idOrSlug || createSlug(m.title) === idOrSlug);
    if (match) return match;

    // 2. Fallback to direct ID fetch if not found locally
    const res = await apiClient.get(`/meetups/${idOrSlug}`);
    return res.data;
  } catch (err) {
    console.error('fetchMeetup error:', err);
    return null;
  }
};

// ── Reservations API ─────────────────────────────────────────────────────────

export const createReservation = async (data) => {
  const res = await apiClient.post('/reservations', data);
  return res.data;
};

export const fetchReservations = async (meetupId) => {
  try {
    const res = await apiClient.get(`/reservations/${meetupId}`);
    return res.data || [];
  } catch {
    return [];
  }
};

export const updateReservationStatus = async (reservationId, status) => {
  const res = await apiClient.put(`/reservations/${reservationId}/status`, { status });
  return res.data;
};

export const fetchUserReservations = async (email) => {
  try {
    const res = await apiClient.get(`/users/${encodeURIComponent(email)}/reservations`);
    return res.data || [];
  } catch (err) {
    console.error('fetchUserReservations error:', err);
    return [];
  }
};

export const scanTicket = async (ticketId, action = 'check_in') => {
  const res = await apiClient.post('/tickets/scan', { ticket_id: ticketId, action });
  return res.data;
};

// ── Payment Approval Workflow API ─────────────────────────────────────────────

/**
 * Creates a reservation in pending_payment state.
 * expires_at is set to now + 10 minutes.
 */
export const createPendingReservation = async (data) => {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const res = await apiClient.post('/reservations', {
    ...data,
    status: 'pending_payment',
    expires_at: expiresAt,
  });
  return res.data;
};

/**
 * Checks if the user already has an active (non-expired) pending_payment
 * reservation for the given meetupId. Returns the reservation or null.
 */
export const checkExistingPending = async (userEmail, meetupId) => {
  if (!userEmail || !meetupId) return null;
  try {
    const res = await apiClient.get(`/users/${encodeURIComponent(userEmail)}/reservations`);
    const all = Array.isArray(res.data) ? res.data : [];
    return all.find(r =>
      (r.meetup_id === meetupId || r.meetup?.id === meetupId) &&
      r.status === 'pending_payment' &&
      r.expires_at &&
      new Date(r.expires_at) > new Date()
    ) || null;
  } catch {
    return null;
  }
};

/**
 * Admin: fetch all pending_payment (and recently expired/rejected) reservations.
 * Sends the admin email as a header for backend validation.
 */
export const fetchPendingApprovals = async (adminEmail) => {
  try {
    const res = await apiClient.get('/reservations/pending', {
      headers: { 'X-Admin-Email': adminEmail },
    });
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('fetchPendingApprovals error:', err);
    return [];
  }
};

/**
 * Admin: approve a pending reservation.
 * Backend sets status=confirmed and generates ticket_id.
 */
export const approveReservation = async (id, adminEmail) => {
  const res = await apiClient.put(
    `/reservations/${id}/approve`,
    {},
    { headers: { 'X-Admin-Email': adminEmail } }
  );
  return res.data;
};

/**
 * Admin: reject a pending reservation (soft-delete, kept 24h).
 */
export const rejectReservation = async (id, adminEmail) => {
  const res = await apiClient.put(
    `/reservations/${id}/reject`,
    {},
    { headers: { 'X-Admin-Email': adminEmail } }
  );
  return res.data;
};


// ── Tag Helpers ───────────────────────────────────────────────────────────────

export const getTagColor = (tag) => {
  const TAG_COLORS = {
    'Founder': 'tag-green',
    'Investor': 'tag-blue',
    'Student': 'tag-purple',
    'Business Owner': 'tag-orange',
  };
  return TAG_COLORS[tag] || 'tag';
};

export const FILTER_TAGS = ['All', 'Founder', 'Student', 'Business Owner', 'Investor', 'Working Professional'];

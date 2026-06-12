import axios from 'axios';
import { Client, Account, ID } from 'appwrite';

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
  } catch {}
};

// ── Members API ───────────────────────────────────────────────────────────────

export const fetchMembers = async () => {
  try {
    const res = await apiClient.get('/members');
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('fetchMembers error:', err);
    return [];
  }
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
    return res.data;
  } catch (err) {
    console.error('createMember error:', err);
    throw err;
  }
};

// ── Meetups API ───────────────────────────────────────────────────────────────

export const fetchMeetups = async () => {
  try {
    const res = await apiClient.get('/meetups');
    return Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('fetchMeetups error:', err);
    return [];
  }
};

export const fetchMeetup = async (meetupId) => {
  try {
    const res = await apiClient.get(`/meetups/${meetupId}`);
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

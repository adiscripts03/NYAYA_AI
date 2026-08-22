import { supabase } from './supabase';

const API_BASE = 'http://localhost:8000/api';

// Helper to get auth headers
const getAuthHeaders = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = { 'Content-Type': 'application/json' };
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  return headers;
};

export const getCases = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/cases`, { headers });
    if (!res.ok) {
      console.error("Error fetching cases: API returned status", res.status);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching cases", err);
    return [];
  }
};

export const saveCase = async (newCase) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers,
      body: JSON.stringify(newCase)
    });
    if (!res.ok) {
      console.error("Error saving case: API returned status", res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error saving case", err);
    return null;
  }
};

export const getCase = async (id) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/cases/${id}`, { headers });
    if (!res.ok) {
      console.error("Error fetching case: API returned status", res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching case", err);
    return null;
  }
};

// ==========================================
// Chat History Storage (separate from cases)
// ==========================================

export const getChatHistory = async () => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/chat`, { headers });
    if (!res.ok) {
      console.error("Error fetching chat history: API returned status", res.status);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching chat history", err);
    return [];
  }
};

export const saveChatSession = async (session) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(session)
    });
    if (!res.ok) {
      console.error("Error saving chat session: API returned status", res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error saving chat session", err);
    return null;
  }
};

export const getChatSession = async (id) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/chat/${id}`, { headers });
    if (!res.ok) {
      console.error("Error fetching chat session: API returned status", res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching chat session", err);
    return null;
  }
};

export const deleteChatSession = async (id) => {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/chat/${id}`, {
      method: 'DELETE',
      headers
    });
    if (!res.ok) {
      console.error("Error deleting chat session: API returned status", res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("Error deleting chat session", err);
    return null;
  }
};

// Helper for the advice API (used by AIChat)
export const getAdviceAuthHeaders = async () => {
  return await getAuthHeaders();
};

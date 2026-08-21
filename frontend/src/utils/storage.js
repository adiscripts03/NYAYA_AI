const API_BASE = 'http://localhost:8000/api';

export const getCases = async () => {
  try {
    const res = await fetch(`${API_BASE}/cases`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching cases", err);
    return [];
  }
};

export const saveCase = async (newCase) => {
  try {
    const res = await fetch(`${API_BASE}/cases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCase)
    });
    return await res.json();
  } catch (err) {
    console.error("Error saving case", err);
  }
};

export const getCase = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/cases/${id}`);
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
    const res = await fetch(`${API_BASE}/chat`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching chat history", err);
    return [];
  }
};

export const saveChatSession = async (session) => {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session)
    });
    return await res.json();
  } catch (err) {
    console.error("Error saving chat session", err);
  }
};

export const getChatSession = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/chat/${id}`);
    return await res.json();
  } catch (err) {
    console.error("Error fetching chat session", err);
    return null;
  }
};

export const deleteChatSession = async (id) => {
  try {
    const res = await fetch(`${API_BASE}/chat/${id}`, {
      method: 'DELETE'
    });
    return await res.json();
  } catch (err) {
    console.error("Error deleting chat session", err);
  }
};

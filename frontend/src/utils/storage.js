export const getCases = () => {
  const cases = localStorage.getItem('nyaya_cases');
  return cases ? JSON.parse(cases) : [];
};

export const saveCase = (newCase) => {
  const cases = getCases();
  // Find if exists
  const index = cases.findIndex(c => c.id === newCase.id);
  if (index >= 0) {
    cases[index] = { ...cases[index], ...newCase, date: new Date().toISOString() };
  } else {
    // Add new, keep only last 3 as requested by user ("previous three cases")
    cases.unshift({ ...newCase, date: new Date().toISOString() });
    if (cases.length > 3) {
      cases.pop();
    }
  }
  localStorage.setItem('nyaya_cases', JSON.stringify(cases));
};

export const getCase = (id) => {
  const cases = getCases();
  return cases.find(c => c.id === id);
};

// ==========================================
// Chat History Storage (separate from cases)
// ==========================================
const CHAT_HISTORY_KEY = 'nyaya_chat_history';
const MAX_CHAT_SESSIONS = 50;

export const getChatHistory = () => {
  try {
    const history = localStorage.getItem(CHAT_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch {
    return [];
  }
};

export const saveChatSession = (session) => {
  const history = getChatHistory();
  const index = history.findIndex(s => s.id === session.id);

  const entry = {
    ...session,
    updatedAt: new Date().toISOString(),
    createdAt: session.createdAt || new Date().toISOString(),
  };

  if (index >= 0) {
    history[index] = entry;
  } else {
    history.unshift(entry);
  }

  // Prune to max sessions
  while (history.length > MAX_CHAT_SESSIONS) {
    history.pop();
  }

  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    // If localStorage is full, remove oldest entries and retry
    if (e.name === 'QuotaExceededError') {
      while (history.length > 5) {
        history.pop();
        try {
          localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
          return;
        } catch {
          continue;
        }
      }
    }
  }
};

export const getChatSession = (id) => {
  const history = getChatHistory();
  return history.find(s => s.id === id);
};

export const deleteChatSession = (id) => {
  const history = getChatHistory();
  const filtered = history.filter(s => s.id !== id);
  localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(filtered));
};

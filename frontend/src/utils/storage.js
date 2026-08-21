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

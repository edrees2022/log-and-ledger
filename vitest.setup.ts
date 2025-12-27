import '@testing-library/jest-dom';
// Silence console noise from auth timeline during tests
const origLog = console.log;
console.log = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('SSO')) return;
  origLog(...args);
};

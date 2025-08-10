export const validate = (state) => {
  const e = {};
  if (!state.username.trim()) e.username = 'Username is required.';
  if (!state.password) e.password = 'Password is required.';
  else if (state.password.length < 8) e.password = 'Password must be at least 8 characters.';
  if (state.mode === 'register') {
    if (!state.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) e.email = 'Email format is invalid.';
  }
  return e;
};

const TOKEN_KEY = 'authToken';
const ROLE_KEY = 'authRole';
const USER_KEY = 'user';

export const saveSession = ({ token, role, user, admin }) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (role) {
    // Store role in lowercase to match frontend expected values
    localStorage.setItem(ROLE_KEY, role.toLowerCase());
  }
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
  if (admin) {
    localStorage.setItem('admin', JSON.stringify(admin));
  }
  
  // Debug: Log what was stored
  console.log('Session saved:', { token: !!token, role: role?.toLowerCase(), user: !!user });
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('admin');
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getRole = () => localStorage.getItem(ROLE_KEY);

export const isAuthenticated = () => {
  const token = getToken();
  const role = getRole();
  return Boolean(token && role);
};

export const getCurrentUser = () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};
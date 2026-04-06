const TOKEN_KEY = 'authToken';
const ROLE_KEY = 'authRole';

export const saveSession = ({ token, role, user, admin }) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (role) {
    localStorage.setItem(ROLE_KEY, role);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
  if (admin) {
    localStorage.setItem('admin', JSON.stringify(admin));
  }
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem('user');
  localStorage.removeItem('admin');
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const getRole = () => localStorage.getItem(ROLE_KEY);

export const isAuthenticated = () => Boolean(getToken());

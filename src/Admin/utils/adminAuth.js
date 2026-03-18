import Cookies from 'js-cookie';

const ADMIN_SESSION_KEY = 'adminSession';

export function setAdminAuth(token, id) {
  Cookies.set('adminToken', token, { expires: 7 });
  if (id) Cookies.set('adminId', id, { expires: 7 });
}

export function setAdminSession(session) {
  try {
    if (!session) return;
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore
  }
}

export function getAdminSession() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAdminToken() {
  return Cookies.get('adminToken');
}

export function removeAdminAuth() {
  Cookies.remove('adminToken');
  Cookies.remove('adminId');
  try {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // ignore
  }
}

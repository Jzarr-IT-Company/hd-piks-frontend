import Cookies from 'js-cookie';

export function setAdminAuth(token, id) {
  Cookies.set('adminToken', token, { expires: 7 });
  if (id) Cookies.set('adminId', id, { expires: 7 });
}

export function getAdminToken() {
  return Cookies.get('adminToken');
}

export function removeAdminAuth() {
  Cookies.remove('adminToken');
  Cookies.remove('adminId');
}

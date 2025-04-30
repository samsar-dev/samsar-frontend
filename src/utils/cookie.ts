import Cookies from 'js-cookie';

const AUTH_TOKEN_KEY = 'jwt';  // Use 'jwt' to match backend expectation

export const setAuthToken = (token: string) => {
  Cookies.set(AUTH_TOKEN_KEY, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
};

export const getAuthToken = (): string | undefined => {
  return Cookies.get(AUTH_TOKEN_KEY);
};

export const clearAuthToken = () => {
  Cookies.remove(AUTH_TOKEN_KEY);
};

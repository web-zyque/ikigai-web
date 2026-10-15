const AUTH_KEY = 'ikigai_auth';

export function hasAuthSession(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const fromStorage = localStorage.getItem(AUTH_KEY) === 'true';
    const fromCookie = document.cookie.includes(`${AUTH_KEY}=true`);
    return fromStorage || fromCookie;
  } catch {
    return false;
  }
}

export function setAuthSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(AUTH_KEY, 'true');
    // Set cookie with production-safe configuration
    const isProduction = window.location.protocol === 'https:';
    const cookieValue = `${AUTH_KEY}=true; path=/; max-age=604800; SameSite=Lax${isProduction ? '; Secure' : ''}`;
    document.cookie = cookieValue;
  } catch {
    // ignore
  }
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(AUTH_KEY);
    // Clear cookie with production-safe configuration
    const isProduction = window.location.protocol === 'https:';
    const cookieValue = `${AUTH_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${isProduction ? '; Secure' : ''}`;
    document.cookie = cookieValue;
  } catch {
    // ignore
  }
}

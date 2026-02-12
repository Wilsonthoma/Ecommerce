// client/src/utils/csrf.js
let csrfToken = '';

export const fetchCsrfToken = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/admin/auth/csrf-token', {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      csrfToken = data.csrfToken;
      console.log('🔒 CSRF token fetched:', csrfToken.substring(0, 10) + '...');
      return csrfToken;
    }
    console.warn('Failed to fetch CSRF token');
    return '';
  } catch (error) {
    console.warn('CSRF token fetch failed:', error);
    return '';
  }
};

export const getCurrentCsrfToken = () => csrfToken;

// Forgot password with CSRF support
export const sendForgotPasswordRequest = async (email) => {
  const token = await fetchCsrfToken();
  
  const response = await fetch('http://localhost:5000/api/admin/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': token
    },
    credentials: 'include',
    body: JSON.stringify({ email })
  });
  
  return response.json();
};
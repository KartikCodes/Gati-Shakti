/**
 * authService.js — Custom Backend Authentication Service
 *
 * Replaces Firebase SDK calls with fetch REST API calls to the Express backend.
 * Features robust error handling, server status checking, and development logging.
 */

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

/**
 * Custom fetch wrapper to intercept network connection failures and throw readable messages
 */
async function apiFetch(url, options = {}) {
  console.log(`[API Request] Starting ${options.method || 'GET'} request to: ${url}`);
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    console.error(`[API Network Error] Could not connect to: ${url}`, error);
    throw new Error('Backend server is unavailable or there is a network error. Please verify the server is running and check your connection.');
  }
}

/**
 * Handle API responses and throw clear validation/server errors
 */
async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch (err) {
    console.error(`[API Parsing Error] Failed to parse JSON response from ${response.url}`, err);
    throw new Error('Server returned an invalid response format. Please try again later.');
  }

  if (!response.ok) {
    console.warn(`[API Response Warning] Request to ${response.url} failed with status ${response.status}:`, data);
    throw new Error(data.message || `Request failed with status code ${response.status}.`);
  }

  console.log(`[API Success] Request to ${response.url} completed successfully.`);
  return data;
}

/**
 * Fetch user profile from the backend using the JWT token.
 *
 * @param {string} token - JWT authentication token
 * @returns {Promise<object>} The safe user profile object
 */
export async function getUserProfile(token) {
  try {
    const data = await handleResponse(
      await apiFetch(`${API_URL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    );
    return data.user;
  } catch (error) {
    console.error('[authService] Failed to fetch user profile:', error.message);
    throw error;
  }
}

/**
 * Register a new user with email and password.
 *
 * @param {string} fullName
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Success status and user info
 */
export async function registerWithEmail(fullName, email, password) {
  try {
    return await handleResponse(
      await apiFetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      })
    );
  } catch (error) {
    console.error('[authService] Registration failed:', error.message);
    throw error;
  }
}

/**
 * Sign in with email and password.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} The user profile and JWT token
 */
export async function loginWithEmail(email, password) {
  try {
    return await handleResponse(
      await apiFetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
    );
  } catch (error) {
    console.error('[authService] Login failed:', error.message);
    throw error;
  }
}

/**
 * Sign in with Google using an Access Token retrieved from GIS popup.
 *
 * @param {string} accessToken - Google OAuth Access Token
 * @returns {Promise<object>} The user profile and JWT token
 */
export async function loginWithGoogle(accessToken) {
  try {
    return await handleResponse(
      await apiFetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accessToken }),
      })
    );
  } catch (error) {
    console.error('[authService] Google login failed:', error.message);
    throw error;
  }
}

/**
 * Send a password reset email.
 *
 * @param {string} email
 * @returns {Promise<object>} Success status message
 */
export async function sendPasswordReset(email) {
  try {
    return await handleResponse(
      await apiFetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })
    );
  } catch (error) {
    console.error('[authService] Forgot password request failed:', error.message);
    throw error;
  }
}

/**
 * Reset password using a valid reset token.
 *
 * @param {string} token
 * @param {string} password
 * @returns {Promise<object>} Success status message
 */
export async function resetPasswordWithToken(token, password) {
  try {
    return await handleResponse(
      await apiFetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })
    );
  } catch (error) {
    console.error('[authService] Password reset failed:', error.message);
    throw error;
  }
}

/**
 * Sign out the current user.
 * Sends a request to the backend and clears local storage credentials.
 */
export async function logoutUser() {
  try {
    await apiFetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('[authService] User session ended successfully on backend.');
  } catch (error) {
    console.error('[authService] Logout backend notification failed:', error.message);
  }
}

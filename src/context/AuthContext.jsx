/**
 * AuthContext.jsx — Custom Authentication Context
 *
 * Persists session using JWT in localStorage.
 * Fetches user profile from the Express backend on load.
 * Exposes authentication methods and user state to the entire app.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  registerWithEmail,
  loginWithEmail as loginWithEmailService,
  loginWithGoogle as loginWithGoogleService,
  sendPasswordReset,
  logoutUser,
  getUserProfile,
  resetPasswordWithToken
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from JWT in localStorage on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('gs_auth_token');
      if (token) {
        try {
          const profile = await getUserProfile(token);
          setUser({
            uid: profile.id || profile._id,
            email: profile.email,
            name: profile.fullName || 'User',
            department: profile.department || null,
            isAdmin: profile.role === 'admin',
            createdAt: profile.createdAt || null
          });
        } catch (err) {
          console.error('Failed to load user profile or token expired:', err.message);
          // Clean up invalid session
          localStorage.removeItem('gs_auth_token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  /**
   * Register a new user and automatically log them in.
   */
  const register = async (fullName, email, password) => {
    console.log(`[AuthContext] Initiating registration for ${email} (${fullName})`);
    await registerWithEmail(fullName, email, password);
    console.log('[AuthContext] Registration successful, initiating automatic login...');
    await loginWithEmail(email, password);
    console.log('[AuthContext] Automatic login completed.');
  };

  /**
   * Log in with email and password.
   */
  const loginWithEmail = async (email, password) => {
    console.log(`[AuthContext] Initiating login for ${email}`);
    const data = await loginWithEmailService(email, password);
    localStorage.setItem('gs_auth_token', data.token);
    setUser({
      uid: data.user.id || data.user._id,
      email: data.user.email,
      name: data.user.fullName || 'User',
      department: data.user.department || null,
      isAdmin: data.user.role === 'admin',
      createdAt: data.user.createdAt || null
    });
    console.log('[AuthContext] Login successful. User state populated.');
  };

  /**
   * Log in with Google Identity Services.
   */
  const loginWithGoogle = async () => {
    console.log('[AuthContext] Initiating Google Sign-In flow');
    return new Promise((resolve, reject) => {
      if (!window.google) {
        console.error('[AuthContext] Google Sign-In SDK (window.google) is not present');
        reject(new Error('Google Sign-In SDK is not loaded. Please try again.'));
        return;
      }

      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              console.warn('[AuthContext] Google SDK returned token error:', tokenResponse.error);
              reject(new Error(tokenResponse.error_description || 'Google sign-in was cancelled or failed.'));
              return;
            }

            try {
              console.log('[AuthContext] Access token received from Google, verifying with custom backend...');
              const data = await loginWithGoogleService(tokenResponse.access_token);
              localStorage.setItem('gs_auth_token', data.token);
              setUser({
                uid: data.user.id || data.user._id,
                email: data.user.email,
                name: data.user.fullName || 'User',
                department: data.user.department || null,
                isAdmin: data.user.role === 'admin',
                createdAt: data.user.createdAt || null
              });
              resolve();
            } catch (err) {
              reject(err);
            }
          },
        });

        client.requestAccessToken();
      } catch (err) {
        reject(err);
      }
    });
  };

  /**
   * Send password reset request (Forgot Password).
   */
  const resetPassword = async (email) => {
    await sendPasswordReset(email);
  };

  /**
   * Reset password using reset token (New Password reset form).
   */
  const confirmPasswordReset = async (token, password) => {
    await resetPasswordWithToken(token, password);
  };

  /**
   * Log out current user session.
   */
  const logout = async () => {
    await logoutUser();
    localStorage.removeItem('gs_auth_token');
    setUser(null);
  };

  // While loading initial profile, hide screen (resolved by App.jsx)
  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        loginWithEmail,
        loginWithGoogle,
        resetPassword,
        confirmPasswordReset,
        logout,
        isAuthenticated: user !== null
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

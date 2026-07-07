import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  initializeStore,
  createUser,
  authenticateUser,
  saveSession,
  restoreSession,
  clearSession
} from './userStore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session
  const initialized = useRef(false);

  // On mount: initialize the user store (seed demo accounts) and restore session
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        await initializeStore();
        const savedSession = restoreSession();
        if (savedSession) {
          setUser(savedSession);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * Register a new user account.
   * - Checks for duplicate email (throws if exists)
   * - Hashes the password and stores the account persistently
   * - Automatically logs in the new user
   */
  const register = async (name, email, password) => {
    const profile = await createUser(name, email, password);
    saveSession(profile);
    setUser(profile);
    return profile;
  };

  /**
   * Log in with email and password.
   * - Verifies credentials against the persistent store
   * - Throws with specific messages for unknown email or wrong password
   */
  const loginWithEmail = async (email, password) => {
    const profile = await authenticateUser(email, password);
    saveSession(profile);
    setUser(profile);
    return profile;
  };

  /**
   * Log out the current user.
   * - Clears the session only — does NOT delete the user account
   */
  const logout = () => {
    clearSession();
    setUser(null);
  };

  // While restoring the session on first load, show nothing (or a loader)
  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        register,
        loginWithEmail,
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

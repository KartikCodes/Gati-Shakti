import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  User,
  Loader2
} from 'lucide-react';

export default function Login() {
  const { loginWithEmail, register } = useAuth();

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState('login');
  // Key to force re-mount animation on mode switch
  const [formKey, setFormKey] = useState(0);

  // Shared form states
  const [email, setEmail] = useState(() => {
    return localStorage.getItem('gs_remembered_email') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return !!localStorage.getItem('gs_remembered_email');
  });

  // Register-only states
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Tracks which register fields have been interacted with (for inline errors)
  const [regTouched, setRegTouched] = useState({});

  // UI Flow states
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Input change handlers that reset error
  const handleEmailChange = (value) => {
    setEmail(value);
    if (error) setError(null);
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    if (error) setError(null);
  };

  // Switch mode with animation key bump
  const switchMode = (newMode) => {
    setMode(newMode);
    setFormKey((k) => k + 1);
    setError(null);
    setSuccess(false);
    setLoading(false);
    // Reset register-specific fields when leaving register mode
    if (newMode === 'login') {
      setFullName('');
      setConfirmPassword('');
      setRegTouched({});
    }
  };

  // --- Login submit ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address (e.g. name@domain.com)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await loginWithEmail(email, password);
      if (rememberMe) {
        localStorage.setItem('gs_remembered_email', email);
      } else {
        localStorage.removeItem('gs_remembered_email');
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
      setLoading(false);
    }
  };

  // --- Register submit ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    // Mark all as touched so inline errors show
    setRegTouched({ fullName: true, email: true, password: true, confirmPassword: true });

    if (!isRegisterFormValid) return;

    setLoading(true);
    setError(null);

    try {
      await register(fullName.trim(), email.trim(), password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  // --- Validation helpers ---
  const isLoginFormValid = email.trim() !== '' && password.trim() !== '';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regErrors = {
    fullName: fullName.trim() === '' ? 'Full name is required.' : null,
    email: email.trim() === '' ? 'Email is required.' : !emailRegex.test(email.trim()) ? 'Please enter a valid email address.' : null,
    password: password === '' ? 'Password is required.' : password.length < 6 ? 'Password must be at least 6 characters.' : null,
    confirmPassword: confirmPassword === '' ? 'Please confirm your password.' : confirmPassword !== password ? 'Passwords do not match.' : null
  };
  const isRegisterFormValid = Object.values(regErrors).every((v) => v === null);

  // ---------- Render ----------
  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo">GS</div>
          <h1 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to access the GatiShakti dashboard.'
              : 'Fill in the details below to get started.'}
          </p>
        </div>

        {/* ========= LOGIN FORM ========= */}
        {mode === 'login' && (
          <div key={formKey} className="auth-form-transition">
            <form className="auth-form" onSubmit={handleLoginSubmit} noValidate>
              {/* Alerts */}
              {error && (
                <div className="auth-alert auth-alert-danger" role="alert">
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="auth-alert auth-alert-success" role="alert">
                  <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>Success! Redirecting to dashboard…</span>
                </div>
              )}

              {/* Email */}
              <div className="auth-field">
                <label htmlFor="login-email" className="auth-label">
                  Email Address
                </label>
                <div className="auth-input-wrap">
                  <Mail size={15} className="auth-input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    className="auth-input"
                    placeholder="name@gatishakti.gov.in"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    disabled={loading || success}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="auth-field">
                <div className="auth-label-row">
                  <label htmlFor="login-password" className="auth-label">
                    Password
                  </label>
                  <a
                    href="#forgot"
                    className="auth-link auth-link-small"
                    onClick={(e) => {
                      e.preventDefault();
                      setError('Please contact system administrator to reset password.');
                    }}
                  >
                    Forgot Password?
                  </a>
                </div>
                <div className="auth-input-wrap">
                  <Lock size={15} className="auth-input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    disabled={loading || success}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <label className="auth-checkbox-row">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading || success}
                />
                <span>Remember Me</span>
              </label>

              {/* Sign In Button */}
              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={!isLoginFormValid || loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="auth-spin" />
                    <span>Signing In…</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Success</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Register */}
            <p className="auth-switch-text">
              Don't have an account?{' '}
              <a
                href="#register"
                className="auth-link"
                onClick={(e) => { e.preventDefault(); switchMode('register'); }}
              >
                Register
              </a>
            </p>
          </div>
        )}

        {/* ========= REGISTER FORM ========= */}
        {mode === 'register' && (
          <div key={formKey} className="auth-form-transition">
            <form className="auth-form" onSubmit={handleRegisterSubmit} noValidate>
              {/* Alerts */}
              {error && (
                <div className="auth-alert auth-alert-danger" role="alert">
                  <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="auth-alert auth-alert-success" role="alert">
                  <CheckCircle2 size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span>Account created! Signing you in…</span>
                </div>
              )}

              {/* Full Name */}
              <div className="auth-field">
                <label htmlFor="reg-name" className="auth-label">
                  Full Name
                </label>
                <div className="auth-input-wrap">
                  <User size={15} className="auth-input-icon" />
                  <input
                    id="reg-name"
                    type="text"
                    className={`auth-input${regTouched.fullName && regErrors.fullName ? ' auth-input-error' : ''}`}
                    placeholder="e.g. Rajesh Kumar"
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); if (error) setError(null); }}
                    onBlur={() => setRegTouched((t) => ({ ...t, fullName: true }))}
                    disabled={loading || success}
                    required
                    autoComplete="name"
                  />
                </div>
                {regTouched.fullName && regErrors.fullName && (
                  <span className="auth-field-error">{regErrors.fullName}</span>
                )}
              </div>

              {/* Email */}
              <div className="auth-field">
                <label htmlFor="reg-email" className="auth-label">
                  Email Address
                </label>
                <div className="auth-input-wrap">
                  <Mail size={15} className="auth-input-icon" />
                  <input
                    id="reg-email"
                    type="email"
                    className={`auth-input${regTouched.email && regErrors.email ? ' auth-input-error' : ''}`}
                    placeholder="name@gatishakti.gov.in"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={() => setRegTouched((t) => ({ ...t, email: true }))}
                    disabled={loading || success}
                    required
                    autoComplete="email"
                  />
                </div>
                {regTouched.email && regErrors.email && (
                  <span className="auth-field-error">{regErrors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="auth-field">
                <label htmlFor="reg-password" className="auth-label">
                  Password
                </label>
                <div className="auth-input-wrap">
                  <Lock size={15} className="auth-input-icon" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className={`auth-input${regTouched.password && regErrors.password ? ' auth-input-error' : ''}`}
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    onBlur={() => setRegTouched((t) => ({ ...t, password: true }))}
                    disabled={loading || success}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-pw"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {regTouched.password && regErrors.password && (
                  <span className="auth-field-error">{regErrors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label htmlFor="reg-confirm" className="auth-label">
                  Confirm Password
                </label>
                <div className="auth-input-wrap">
                  <Lock size={15} className="auth-input-icon" />
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`auth-input${regTouched.confirmPassword && regErrors.confirmPassword ? ' auth-input-error' : ''}`}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(null); }}
                    onBlur={() => setRegTouched((t) => ({ ...t, confirmPassword: true }))}
                    disabled={loading || success}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-pw"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    tabIndex={0}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {regTouched.confirmPassword && regErrors.confirmPassword && (
                  <span className="auth-field-error">{regErrors.confirmPassword}</span>
                )}
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={!isRegisterFormValid || loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="auth-spin" />
                    <span>Creating Account…</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Success</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Login */}
            <p className="auth-switch-text">
              Already have an account?{' '}
              <a
                href="#login"
                className="auth-link"
                onClick={(e) => { e.preventDefault(); switchMode('login'); }}
              >
                Sign In
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

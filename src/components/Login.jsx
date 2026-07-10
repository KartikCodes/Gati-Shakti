import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  User,
  Loader2,
  ArrowLeft
} from 'lucide-react';

export default function Login() {
  const { loginWithEmail, register, loginWithGoogle, resetPassword, confirmPasswordReset } = useAuth();

  // Mode: 'login', 'register', 'forgot', or 'reset'
  const [mode, setMode] = useState('login');
  // Key to force re-mount animation on mode switch
  const [formKey, setFormKey] = useState(0);

  // Reset token state for password reset flow
  const [resetToken, setResetToken] = useState('');

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

  // Listen to hash changes to trigger password reset mode
  React.useEffect(() => {
    const checkHash = () => {
      if (window.location.hash.startsWith('#reset-password')) {
        const query = window.location.hash.split('?')[1] || '';
        const params = new URLSearchParams(query);
        const token = params.get('token');
        if (token) {
          setResetToken(token);
          setMode('reset');
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

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
      toast.success(`Welcome back!`, { duration: 3000 });
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
      toast.success('Account created successfully.', { duration: 3000 });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };

  // --- Google sign-in ---
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle();
      setSuccess(true);
      toast.success('Signed in with Google!', { duration: 3000 });
    } catch (err) {
      // Don't show error if user just closed the popup
      if (err.message !== 'Sign-in popup was closed. Please try again.' &&
          err.message !== 'Sign-in was cancelled.') {
        setError(err.message || 'Google sign-in failed. Please try again.');
      }
      setLoading(false);
    }
  };

  // --- Forgot password submit ---
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await resetPassword(email.trim());
      setSuccess(true);
      toast.success('Password reset email sent! Check your inbox.', { duration: 4000 });
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
      setLoading(false);
    }
  };

  // --- Reset password submit ---
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await confirmPasswordReset(resetToken, password);
      setSuccess(true);
      toast.success('Password reset successfully! Redirecting to sign in...', { duration: 3000 });
      setTimeout(() => {
        window.location.hash = '';
        switchMode('login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may be expired.');
      setLoading(false);
    }
  };

  // --- Validation helpers ---
  const isLoginFormValid = email.trim() !== '' && password.trim() !== '';

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regErrors = {
    fullName: fullName.trim() === '' ? 'Full name is required.' : null,
    email: email.trim() === '' ? 'Email is required.' : !emailRegex.test(email.trim()) ? 'Please enter a valid email address.' : null,
    password: password === '' ? 'Password is required.' : password.length < 8 ? 'Password must be at least 8 characters.' : null,
    confirmPassword: confirmPassword === '' ? 'Please confirm your password.' : confirmPassword !== password ? 'Passwords do not match.' : null
  };
  const isRegisterFormValid = Object.values(regErrors).every((v) => v === null);

  // Google SVG icon
  const GoogleIcon = () => (
    <svg width="18" height="18" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );

  // ---------- Render ----------
  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-header">
          <div className="auth-logo">GS</div>
          <h1 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Your Account' : mode === 'reset' ? 'Create New Password' : 'Reset Password'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'login'
              ? 'Sign in to access the GatiShakti dashboard.'
              : mode === 'register'
              ? 'Fill in the details below to get started.'
              : mode === 'reset'
              ? 'Choose a strong new password below.'
              : 'Enter your email to receive a reset link.'}
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
                      switchMode('forgot');
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

              {/* Divider */}
              <div className="auth-divider">
                <span>OR</span>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                className="auth-google-btn"
                onClick={handleGoogleSignIn}
                disabled={loading || success}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
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
                    placeholder="At least 8 characters"
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

              {/* Divider */}
              <div className="auth-divider">
                <span>OR</span>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                className="auth-google-btn"
                onClick={handleGoogleSignIn}
                disabled={loading || success}
              >
                <GoogleIcon />
                <span>Continue with Google</span>
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

        {/* ========= FORGOT PASSWORD FORM ========= */}
        {mode === 'forgot' && (
          <div key={formKey} className="auth-form-transition">
            <form className="auth-form" onSubmit={handleForgotSubmit} noValidate>
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
                  <span>Reset link sent! Check your inbox.</span>
                </div>
              )}

              {/* Email */}
              <div className="auth-field">
                <label htmlFor="forgot-email" className="auth-label">
                  Email Address
                </label>
                <div className="auth-input-wrap">
                  <Mail size={15} className="auth-input-icon" />
                  <input
                    id="forgot-email"
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

              {/* Send Reset Email Button */}
              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={!email.trim() || loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="auth-spin" />
                    <span>Sending…</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Email Sent</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <p className="auth-switch-text">
              <a
                href="#login"
                className="auth-link"
                onClick={(e) => { e.preventDefault(); switchMode('login'); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </a>
            </p>
          </div>
        )}

        {/* ========= RESET PASSWORD FORM ========= */}
        {mode === 'reset' && (
          <div key={formKey} className="auth-form-transition">
            <form className="auth-form" onSubmit={handleResetSubmit} noValidate>
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
                  <span>Password reset successful! Redirecting…</span>
                </div>
              )}

              {/* Password */}
              <div className="auth-field">
                <label htmlFor="reset-password" className="auth-label">
                  New Password
                </label>
                <div className="auth-input-wrap">
                  <Lock size={15} className="auth-input-icon" />
                  <input
                    id="reset-password"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
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
              </div>

              {/* Confirm Password */}
              <div className="auth-field">
                <label htmlFor="reset-confirm" className="auth-label">
                  Confirm Password
                </label>
                <div className="auth-input-wrap">
                  <Lock size={15} className="auth-input-icon" />
                  <input
                    id="reset-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (error) setError(null); }}
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
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary auth-submit"
                disabled={!password || !confirmPassword || loading || success}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="auth-spin" />
                    <span>Resetting Password…</span>
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Success</span>
                  </>
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <p className="auth-switch-text">
              <a
                href="#login"
                className="auth-link"
                onClick={(e) => { e.preventDefault(); window.location.hash = ''; switchMode('login'); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { authService } from '../services/authService';
import type { UserDto } from '../types/auth';

export interface AuthViewProps {
  onAuthSuccess: (user: UserDto) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [theme, toggleTheme] = useTheme();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail: string = email.trim();
    const trimmedPassword: string = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (isRegister && !fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (trimmedPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister) {
        const response = await authService.register({
          fullName: fullName.trim(),
          email: trimmedEmail,
          password: trimmedPassword,
        });
        onAuthSuccess(response.user);
      } else {
        const response = await authService.login({
          email: trimmedEmail,
          password: trimmedPassword,
        });
        onAuthSuccess(response.user);
      }
    } catch (err) {
      const message: string =
        err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = (registerMode: boolean): void => {
    setIsRegister(registerMode);
    setErrorMessage(null);
  };

  return (
    <div className="auth-wrapper">
      {/* Theme toggle in top right corner */}
      <div className="auth-top-toolbar">
        <button
          type="button"
          className="btn-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-logo auth-logo">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4" />
              <path d="m16.2 7.8 2.9-2.9" />
              <path d="M18 12h4" />
              <path d="m16.2 16.2 2.9 2.9" />
              <path d="M12 18v4" />
              <path d="m4.9 19.1 2.9-2.9" />
              <path d="M2 12h4" />
              <path d="m4.9 4.9 2.9 2.9" />
            </svg>
          </div>
          <h1 className="auth-title">TaskManager AI</h1>
          <p className="auth-subtitle">
            Modern SaaS productivity workspace with daily planning & history archive
          </p>
        </div>

        {/* Tab switch between Sign In and Register */}
        <div className="auth-tab-bar">
          <button
            type="button"
            className={`auth-tab ${!isRegister ? 'active' : ''}`}
            onClick={() => toggleMode(false)}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${isRegister ? 'active' : ''}`}
            onClick={() => toggleMode(true)}
          >
            Create Account
          </button>
        </div>

        {errorMessage && (
          <div className="alert-banner auth-alert">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div className="alert-content">{errorMessage}</div>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="jane@example.com"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              disabled={isLoading}
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="btn-loading">
                <span className="spinner-small" /> {isRegister ? 'Creating Account...' : 'Signing In...'}
              </span>
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In to Workspace'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>{isRegister ? 'Already have an account?' : "Don't have an account yet?"}</span>{' '}
          <button
            type="button"
            className="auth-toggle-btn"
            onClick={() => toggleMode(!isRegister)}
            disabled={isLoading}
          >
            {isRegister ? 'Sign in' : 'Create an account'}
          </button>
        </div>
      </div>
    </div>
  );
};

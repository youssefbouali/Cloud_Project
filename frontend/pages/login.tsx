import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signin } from '../store/slices/authSlice';

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!username || !password) {
      setLocalError('Please enter both username and password');
      return;
    }

    const result = await dispatch(
      signin({ username: username.toLowerCase(), password }),
    );

    if (result.payload && !(result.payload instanceof Error)) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-form-section">
          <div className="auth-logo">
            <div className="logo-icon">
              <svg width="25" height="20" viewBox="0 0 25 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.75 2.5C3.75 1.80859 4.30859 1.25 5 1.25H6.25C6.94141 1.25 7.5 1.80859 7.5 2.5V8.75V11.25V17.5C7.5 18.1914 6.94141 18.75 6.25 18.75H5C4.30859 18.75 3.75 18.1914 3.75 17.5V15H2.5C1.80859 15 1.25 14.4414 1.25 13.75V11.25C0.558594 11.25 0 10.6914 0 10C0 9.30859 0.558594 8.75 1.25 8.75V6.25C1.25 5.55859 1.80859 5 2.5 5H3.75V2.5ZM21.25 2.5V5H22.5C23.1914 5 23.75 5.55859 23.75 6.25V8.75C24.4414 8.75 25 9.30859 25 10C25 10.6914 24.4414 11.25 23.75 11.25V13.75C23.75 14.4414 23.1914 15 22.5 15H21.25V17.5C21.25 18.1914 20.6914 18.75 20 18.75H18.75C18.0586 18.75 17.5 18.1914 17.5 17.5V11.25V8.75V2.5C17.5 1.80859 18.0586 1.25 18.75 1.25H20C20.6914 1.25 21.25 1.80859 21.25 2.5ZM16.25 8.75V11.25H8.75V8.75H16.25Z" fill="white"/>
              </svg>
            </div>
            <span className="logo-text">FitTrack</span>
          </div>

          <div className="auth-header">
            <h1 className="auth-title">Login</h1>
            <p className="auth-subtitle">Enter your credentials to access your dashboard.</p>
          </div>

          {(localError || error) && (
            <div className="error-message">{localError || error}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Username or Email</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 3.5C1.725 3.5 1.5 3.725 1.5 4V4.69063L6.89062 9.11563C7.5375 9.64688 8.46562 9.64688 9.1125 9.11563L14.5 4.69063V4C14.5 3.725 14.275 3.5 14 3.5H2ZM1.5 6.63125V12C1.5 12.275 1.725 12.5 2 12.5H14C14.275 12.5 14.5 12.275 14.5 12V6.63125L10.0625 10.275C8.8625 11.2594 7.13438 11.2594 5.9375 10.275L1.5 6.63125ZM0 4C0 2.89688 0.896875 2 2 2H14C15.1031 2 16 2.89688 16 4V12C16 13.1031 15.1031 14 14 14H2C0.896875 14 0 13.1031 0 12V4Z" fill="#9CA3AF"/>
                  </svg>
                </div>
                <input
                  className="form-input"
                  type="text"
                  placeholder="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <div className="input-icon">
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.5 4.5V6H9.5V4.5C9.5 3.11875 8.38125 2 7 2C5.61875 2 4.5 3.11875 4.5 4.5ZM2.5 6V4.5C2.5 2.01562 4.51562 0 7 0C9.48438 0 11.5 2.01562 11.5 4.5V6H12C13.1031 6 14 6.89687 14 8V14C14 15.1031 13.1031 16 12 16H2C0.896875 16 0 15.1031 0 14V8C0 6.89687 0.896875 6 2 6H2.5Z" fill="#9CA3AF"/>
                  </svg>
                </div>
                <input
                  className="form-input"
                  type="password"
                  placeholder="•••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="forgot-password-wrapper">
              <a href="#" className="forgot-password-link">Forgot password?</a>
            </div>

            <button
              className="auth-submit-button"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">Don't have an account?</p>
            <Link href="/register" className="auth-footer-link">
              Sign up here
            </Link>
          </div>

          <Link href="/" className="back-home-link">
            <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.257019 6.38213C-0.0847778 6.72393 -0.0847778 7.279 0.257019 7.6208L4.63202 11.9958C4.97382 12.3376 5.52889 12.3376 5.87069 11.9958C6.21249 11.654 6.21249 11.0989 5.87069 10.7571L2.98593 7.8751H11.375C11.859 7.8751 12.25 7.48408 12.25 7.0001C12.25 6.51611 11.859 6.1251 11.375 6.1251H2.98866L5.86796 3.24307C6.20975 2.90127 6.20975 2.34619 5.86796 2.00439C5.52616 1.6626 4.97108 1.6626 4.62928 2.00439L0.254285 6.3794L0.257019 6.38213Z" fill="#6B7280"/>
            </svg>
            Back to home
          </Link>
        </div>

        <div className="auth-welcome-section">
          <div className="welcome-decoration welcome-decoration-top"></div>
          <div className="welcome-decoration welcome-decoration-bottom"></div>
          
          <div className="welcome-content">
            <div className="welcome-icon">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 7.5C7.5 5.42578 5.82422 3.75 3.75 3.75C1.67578 3.75 0 5.42578 0 7.5V46.875C0 52.0547 4.19531 56.25 9.375 56.25H56.25C58.3242 56.25 60 54.5742 60 52.5C60 50.4258 58.3242 48.75 56.25 48.75H9.375C8.34375 48.75 7.5 47.9062 7.5 46.875V7.5ZM55.1484 17.6484C56.6133 16.1836 56.6133 13.8047 55.1484 12.3398C53.6836 10.875 51.3047 10.875 49.8398 12.3398L37.5 24.6914L30.7734 17.9648C29.3086 16.5 26.9297 16.5 25.4648 17.9648L12.3398 31.0898C10.875 32.5547 10.875 34.9336 12.3398 36.3984C13.8047 37.8633 16.1836 37.8633 17.6484 36.3984L28.125 25.9336L34.8516 32.6602C36.3164 34.125 38.6953 34.125 40.1602 32.6602L55.1602 17.6602L55.1484 17.6484Z" fill="white"/>
              </svg>
            </div>

            <h2 className="welcome-title">Welcome Back to FitTrack</h2>
            <p className="welcome-description">
              Track your fitness journey, monitor your progress, and achieve your health goals with powerful analytics and insights.
            </p>

            <div className="welcome-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.7063 3.29395C14.0969 3.68457 14.0969 4.31895 13.7063 4.70957L5.70627 12.7096C5.31565 13.1002 4.68127 13.1002 4.29065 12.7096L0.290649 8.70957C-0.0999756 8.31895 -0.0999756 7.68457 0.290649 7.29395C0.681274 6.90332 1.31565 6.90332 1.70627 7.29395L5.00002 10.5846L12.2938 3.29395C12.6844 2.90332 13.3188 2.90332 13.7094 3.29395H13.7063Z" fill="white"/>
                  </svg>
                </div>
                <span>Real-time workout tracking</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.7063 3.29395C14.0969 3.68457 14.0969 4.31895 13.7063 4.70957L5.70627 12.7096C5.31565 13.1002 4.68127 13.1002 4.29065 12.7096L0.290649 8.70957C-0.0999756 8.31895 -0.0999756 7.68457 0.290649 7.29395C0.681274 6.90332 1.31565 6.90332 1.70627 7.29395L5.00002 10.5846L12.2938 3.29395C12.6844 2.90332 13.3188 2.90332 13.7094 3.29395H13.7063Z" fill="white"/>
                  </svg>
                </div>
                <span>Personalized fitness plans</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.7063 3.29395C14.0969 3.68457 14.0969 4.31895 13.7063 4.70957L5.70627 12.7096C5.31565 13.1002 4.68127 13.1002 4.29065 12.7096L0.290649 8.70957C-0.0999756 8.31895 -0.0999756 7.68457 0.290649 7.29395C0.681274 6.90332 1.31565 6.90332 1.70627 7.29395L5.00002 10.5846L12.2938 3.29395C12.6844 2.90332 13.3188 2.90332 13.7094 3.29395H13.7063Z" fill="white"/>
                  </svg>
                </div>
                <span>Comprehensive analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

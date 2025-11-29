import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signup, confirmSignup } from '../store/slices/authSlice';

export default function Register() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);

  const [step, setStep] = useState<'signup' | 'confirm'>('signup');
  const [email, setEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string>('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !username || !password || !confirmPassword) {
      setLocalError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters');
      return;
    }

    if (!termsAccepted) {
      setLocalError('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    const result = await dispatch(
      signup({
        email,
        password,
        username: username.toLowerCase(),
      }),
    );

    if (!result.payload || result.payload instanceof Error) {
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!confirmationCode) {
      setLocalError('Please enter the confirmation code');
      return;
    }

    const result = await dispatch(
      confirmSignup({
        username: username.toLowerCase(),
        code: confirmationCode,
      }),
    );

    if (result.payload && !(result.payload instanceof Error)) {
      router.push('/dashboard');
    }
  };

  if (step === 'confirm') {
    return (
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '600px' }}>
          <div className="auth-form-section" style={{ padding: '64px 136px' }}>
            <div className="auth-header">
              <h1 className="auth-title" style={{ fontSize: '30px' }}>Confirm Your Email</h1>
              <p className="auth-subtitle">We sent a confirmation code to {email}</p>
            </div>

            {(localError || error) && (
              <div className="error-message">{localError || error}</div>
            )}

            <form onSubmit={handleConfirm} className="auth-form">
              <div className="form-group">
                <label className="form-label">Confirmation Code</label>
                <input
                  className="form-input"
                  style={{ paddingLeft: '12px' }}
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  disabled={loading}
                  placeholder="123456"
                  required
                />
              </div>

              <button className="auth-submit-button" type="submit" disabled={loading}>
                {loading ? 'Confirming...' : 'Confirm'}
              </button>
            </form>

            <div className="auth-footer">
              <button
                onClick={() => setStep('signup')}
                className="auth-footer-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Back to signup
              </button>
            </div>

            <Link href="/" className="back-home-link">
              <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.257019 6.38213C-0.0847778 6.72393 -0.0847778 7.279 0.257019 7.6208L4.63202 11.9958C4.97382 12.3376 5.52889 12.3376 5.87069 11.9958C6.21249 11.654 6.21249 11.0989 5.87069 10.7571L2.98593 7.8751H11.375C11.859 7.8751 12.25 7.48408 12.25 7.0001C12.25 6.51611 11.859 6.1251 11.375 6.1251H2.98866L5.86796 3.24307C6.20975 2.90127 6.20975 2.34619 5.86796 2.00439C5.52616 1.6626 4.97108 1.6626 4.62928 2.00439L0.254285 6.3794L0.257019 6.38213Z" fill="#6B7280"/>
              </svg>
              Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container register-container">
      <div className="auth-card register-card">
        <div className="register-welcome-section">
          <div className="register-welcome-content">
            <div className="register-branding">
              <div className="register-logo-icon">
                <svg width="38" height="30" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.625 3.75C5.625 2.71289 6.46289 1.875 7.5 1.875H9.375C10.4121 1.875 11.25 2.71289 11.25 3.75V13.125V16.875V26.25C11.25 27.2871 10.4121 28.125 9.375 28.125H7.5C6.46289 28.125 5.625 27.2871 5.625 26.25V22.5H3.75C2.71289 22.5 1.875 21.6621 1.875 20.625V16.875C0.837891 16.875 0 16.0371 0 15C0 13.9629 0.837891 13.125 1.875 13.125V9.375C1.875 8.33789 2.71289 7.5 3.75 7.5H5.625V3.75ZM31.875 3.75V7.5H33.75C34.7871 7.5 35.625 8.33789 35.625 9.375V13.125C36.6621 13.125 37.5 13.9629 37.5 15C37.5 16.0371 36.6621 16.875 35.625 16.875V20.625C35.625 21.6621 34.7871 22.5 33.75 22.5H31.875V26.25C31.875 27.2871 31.0371 28.125 30 28.125H28.125C27.0879 28.125 26.25 27.2871 26.25 26.25V16.875V13.125V3.75C26.25 2.71289 27.0879 1.875 28.125 1.875H30C31.0371 1.875 31.875 2.71289 31.875 3.75ZM24.375 13.125V16.875H13.125V13.125H24.375Z" fill="white"/>
                </svg>
              </div>
              <h1 className="register-brand-title">FitTrack</h1>
              <p className="register-brand-subtitle">Your Personal Fitness Journey Starts Here</p>
            </div>

            <div className="register-features">
              <div className="register-feature-card">
                <div className="register-feature-icon">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 2.5C2.5 1.80859 1.94141 1.25 1.25 1.25C0.558594 1.25 0 1.80859 0 2.5V15.625C0 17.3516 1.39844 18.75 3.125 18.75H18.75C19.4414 18.75 20 18.1914 20 17.5C20 16.8086 19.4414 16.25 18.75 16.25H3.125C2.78125 16.25 2.5 15.9688 2.5 15.625V2.5ZM18.3828 5.88281C18.8711 5.39453 18.8711 4.60156 18.3828 4.11328C17.8945 3.625 17.1016 3.625 16.6133 4.11328L12.5 8.23047L10.2578 5.98828C9.76953 5.5 8.97656 5.5 8.48828 5.98828L4.11328 10.3633C3.625 10.8516 3.625 11.6445 4.11328 12.1328C4.60156 12.6211 5.39453 12.6211 5.88281 12.1328L9.375 8.64453L11.6172 10.8867C12.1055 11.375 12.8984 11.375 13.3867 10.8867L18.3867 5.88672L18.3828 5.88281Z" fill="white"/>
                  </svg>
                </div>
                <div>
                  <h3 className="register-feature-title">Track Progress</h3>
                  <p className="register-feature-desc">Monitor your workouts and achievements</p>
                </div>
              </div>

              <div className="register-feature-card">
                <div className="register-feature-icon">
                  <svg width="25" height="20" viewBox="0 0 25 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.625 0C6.4538 0 7.24866 0.32924 7.83471 0.915291C8.42076 1.50134 8.75 2.2962 8.75 3.125C8.75 3.9538 8.42076 4.74866 7.83471 5.33471C7.24866 5.92076 6.4538 6.25 5.625 6.25C4.7962 6.25 4.00134 5.92076 3.41529 5.33471C2.82924 4.74866 2.5 3.9538 2.5 3.125C2.5 2.2962 2.82924 1.50134 3.41529 0.915291C4.00134 0.32924 4.7962 0 5.625 0ZM20 0C20.8288 0 21.6237 0.32924 22.2097 0.915291C22.7958 1.50134 23.125 2.2962 23.125 3.125C23.125 3.9538 22.7958 4.74866 22.2097 5.33471C21.6237 5.92076 20.8288 6.25 20 6.25C19.1712 6.25 18.3763 5.92076 17.7903 5.33471C17.2042 4.74866 16.875 3.9538 16.875 3.125C16.875 2.2962 17.2042 1.50134 17.7903 0.915291C18.3763 0.32924 19.1712 0 20 0ZM0 11.668C0 9.36719 1.86719 7.5 4.16797 7.5H5.83594C6.45703 7.5 7.04688 7.63672 7.57812 7.87891C7.52734 8.16016 7.50391 8.45312 7.50391 8.75C7.50391 10.2422 8.16016 11.582 9.19531 12.5C9.1875 12.5 9.17969 12.5 9.16797 12.5H0.832031C0.375 12.5 0 12.125 0 11.668ZM15.832 12.5C15.8242 12.5 15.8164 12.5 15.8047 12.5C16.8438 11.582 17.4961 10.2422 17.4961 8.75C17.4961 8.45312 17.4688 8.16406 17.4219 7.87891C17.9531 7.63281 18.543 7.5 19.1641 7.5H20.832C23.1328 7.5 25 9.36719 25 11.668C25 12.1289 24.625 12.5 24.168 12.5H15.832ZM8.75 8.75C8.75 7.75544 9.14509 6.80161 9.84835 6.09835C10.5516 5.39509 11.5054 5 12.5 5C13.4946 5 14.4484 5.39509 15.1517 6.09835C15.8549 6.80161 16.25 7.75544 16.25 8.75C16.25 9.74456 15.8549 10.6984 15.1517 11.4017C14.4484 12.1049 13.4946 12.5 12.5 12.5C11.5054 12.5 10.5516 12.1049 9.84835 11.4017C9.14509 10.6984 8.75 9.74456 8.75 8.75ZM5 18.957C5 16.082 7.33203 13.75 10.207 13.75H14.793C17.668 13.75 20 16.082 20 18.957C20 19.5312 19.5352 20 18.957 20H6.04297C5.46875 20 5 19.5352 5 18.957Z" fill="white"/>
                  </svg>
                </div>
                <div>
                  <h3 className="register-feature-title">Join Community</h3>
                  <p className="register-feature-desc">Connect with fitness enthusiasts</p>
                </div>
              </div>

              <div className="register-feature-card">
                <div className="register-feature-icon">
                  <svg width="23" height="20" viewBox="0 0 23 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.625 0H6.875C5.83984 0 4.99609 0.851563 5.03516 1.88281C5.04297 2.08984 5.05078 2.29688 5.0625 2.5H0.9375C0.417969 2.5 0 2.91797 0 3.4375C0 7.05469 1.30859 9.57031 3.06641 11.2773C4.79688 12.9609 6.90625 13.8086 8.46094 14.2383C9.375 14.4922 10 15.2539 10 16.0195C10 16.8359 9.33594 17.5 8.51953 17.5H7.5C6.80859 17.5 6.25 18.0586 6.25 18.75C6.25 19.4414 6.80859 20 7.5 20H15C15.6914 20 16.25 19.4414 16.25 18.75C16.25 18.0586 15.6914 17.5 15 17.5H13.9805C13.1641 17.5 12.5 16.8359 12.5 16.0195C12.5 15.2539 13.1211 14.4883 14.0391 14.2383C15.5977 13.8086 17.707 12.9609 19.4375 11.2773C21.1914 9.57031 22.5 7.05469 22.5 3.4375C22.5 2.91797 22.082 2.5 21.5625 2.5H17.4375C17.4492 2.29688 17.457 2.09375 17.4648 1.88281C17.5039 0.851563 16.6602 0 15.625 0ZM1.91016 4.375H5.20703C5.5625 7.89453 6.34766 10.2461 7.23438 11.8203C6.26172 11.3906 5.25 10.7852 4.375 9.93359C3.125 8.71875 2.10938 6.96484 1.91406 4.375H1.91016ZM18.1289 9.93359C17.2539 10.7852 16.2422 11.3906 15.2695 11.8203C16.1562 10.2461 16.9414 7.89453 17.2969 4.375H20.5938C20.3945 6.96484 19.3789 8.71875 18.1328 9.93359H18.1289Z" fill="white"/>
                  </svg>
                </div>
                <div>
                  <h3 className="register-feature-title">Achieve Goals</h3>
                  <p className="register-feature-desc">Set and reach your fitness targets</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="register-form-section">
          <div className="register-back-link-wrapper">
            <Link href="/" className="register-back-link">
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.293701 7.29365C-0.0969238 7.68428 -0.0969238 8.31865 0.293701 8.70928L5.2937 13.7093C5.68433 14.0999 6.3187 14.0999 6.70933 13.7093C7.09995 13.3187 7.09995 12.6843 6.70933 12.2937L3.41245 8.9999H13C13.5531 8.9999 14 8.55303 14 7.9999C14 7.44678 13.5531 6.9999 13 6.9999H3.41558L6.7062 3.70615C7.09683 3.31553 7.09683 2.68115 6.7062 2.29053C6.31558 1.8999 5.6812 1.8999 5.29058 2.29053L0.290576 7.29053L0.293701 7.29365Z" fill="#6B7280"/>
              </svg>
              Back to home
            </Link>
          </div>

          <div className="register-form-content">
            <div className="auth-header">
              <h1 className="auth-title register-title">Create Account</h1>
              <p className="auth-subtitle">Sign up to start tracking your activities.</p>
            </div>

            {(localError || error) && (
              <div className="error-message">{localError || error}</div>
            )}

            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 2C0.671875 2 0 2.67188 0 3.5C0 3.97187 0.221875 4.41562 0.6 4.7L7.4 9.8C7.75625 10.0656 8.24375 10.0656 8.6 9.8L15.4 4.7C15.7781 4.41562 16 3.97187 16 3.5C16 2.67188 15.3281 2 14.5 2H1.5ZM0 5.5V12C0 13.1031 0.896875 14 2 14H14C15.1031 14 16 13.1031 16 12V5.5L9.2 10.6C8.4875 11.1344 7.5125 11.1344 6.8 10.6L0 5.5Z" fill="#9CA3AF"/>
                    </svg>
                  </div>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 8C8.06087 8 9.07828 7.57857 9.82843 6.82843C10.5786 6.07828 11 5.06087 11 4C11 2.93913 10.5786 1.92172 9.82843 1.17157C9.07828 0.421427 8.06087 0 7 0C5.93913 0 4.92172 0.421427 4.17157 1.17157C3.42143 1.92172 3 2.93913 3 4C3 5.06087 3.42143 6.07828 4.17157 6.82843C4.92172 7.57857 5.93913 8 7 8ZM5.57188 9.5C2.49375 9.5 0 11.9937 0 15.0719C0 15.5844 0.415625 16 0.928125 16H13.0719C13.5844 16 14 15.5844 14 15.0719C14 11.9937 11.5063 9.5 8.42813 9.5H5.57188Z" fill="#9CA3AF"/>
                    </svg>
                  </div>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="Choose a username"
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
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.99995 1C6.47495 1 4.45308 2.15 2.9812 3.51875C1.5187 4.875 0.540576 6.5 0.0780762 7.61562C-0.0250488 7.8625 -0.0250488 8.1375 0.0780762 8.38437C0.540576 9.5 1.5187 11.125 2.9812 12.4812C4.45308 13.85 6.47495 15 8.99995 15C11.525 15 13.5468 13.85 15.0187 12.4812C16.4812 11.1219 17.4593 9.5 17.9249 8.38437C18.0281 8.1375 18.0281 7.8625 17.9249 7.61562C17.4593 6.5 16.4812 4.875 15.0187 3.51875C13.5468 2.15 11.525 1 8.99995 1ZM4.49995 8C4.49995 6.80653 4.97406 5.66193 5.81797 4.81802C6.66188 3.97411 7.80648 3.5 8.99995 3.5C10.1934 3.5 11.338 3.97411 12.1819 4.81802C13.0258 5.66193 13.5 6.80653 13.5 8C13.5 9.19347 13.0258 10.3381 12.1819 11.182C11.338 12.0259 10.1934 12.5 8.99995 12.5C7.80648 12.5 6.66188 12.0259 5.81797 11.182C4.97406 10.3381 4.49995 9.19347 4.49995 8ZM8.99995 6C8.99995 7.10313 8.10308 8 6.99995 8C6.77808 8 6.56558 7.9625 6.36558 7.89687C6.1937 7.84062 5.9937 7.94688 5.99995 8.12813C6.00933 8.34375 6.04058 8.55937 6.09995 8.775C6.52808 10.375 8.17495 11.325 9.77495 10.8969C11.375 10.4688 12.325 8.82188 11.8968 7.22188C11.55 5.925 10.4031 5.05312 9.12808 5C8.94683 4.99375 8.84058 5.19062 8.89683 5.36562C8.96245 5.56562 8.99995 5.77812 8.99995 6Z" fill="#9CA3AF"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <div className="input-icon">
                    <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.5 4.5V6H9.5V4.5C9.5 3.11875 8.38125 2 7 2C5.61875 2 4.5 3.11875 4.5 4.5ZM2.5 6V4.5C2.5 2.01562 4.51562 0 7 0C9.48438 0 11.5 2.01562 11.5 4.5V6H12C13.1031 6 14 6.89687 14 8V14C14 15.1031 13.1031 16 12 16H2C0.896875 16 0 15.1031 0 14V8C0 6.89687 0.896875 6 2 6H2.5Z" fill="#9CA3AF"/>
                    </svg>
                  </div>
                  <input
                    className="form-input"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <svg width="18" height="16" viewBox="0 0 18 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.99995 1C6.47495 1 4.45308 2.15 2.9812 3.51875C1.5187 4.875 0.540576 6.5 0.0780762 7.61562C-0.0250488 7.8625 -0.0250488 8.1375 0.0780762 8.38437C0.540576 9.5 1.5187 11.125 2.9812 12.4812C4.45308 13.85 6.47495 15 8.99995 15C11.525 15 13.5468 13.85 15.0187 12.4812C16.4812 11.1219 17.4593 9.5 17.9249 8.38437C18.0281 8.1375 18.0281 7.8625 17.9249 7.61562C17.4593 6.5 16.4812 4.875 15.0187 3.51875C13.5468 2.15 11.525 1 8.99995 1ZM4.49995 8C4.49995 6.80653 4.97406 5.66193 5.81797 4.81802C6.66188 3.97411 7.80648 3.5 8.99995 3.5C10.1934 3.5 11.338 3.97411 12.1819 4.81802C13.0258 5.66193 13.5 6.80653 13.5 8C13.5 9.19347 13.0258 10.3381 12.1819 11.182C11.338 12.0259 10.1934 12.5 8.99995 12.5C7.80648 12.5 6.66188 12.0259 5.81797 11.182C4.97406 10.3381 4.49995 9.19347 4.49995 8ZM8.99995 6C8.99995 7.10313 8.10308 8 6.99995 8C6.77808 8 6.56558 7.9625 6.36558 7.89687C6.1937 7.84062 5.9937 7.94688 5.99995 8.12813C6.00933 8.34375 6.04058 8.55937 6.09995 8.775C6.52808 10.375 8.17495 11.325 9.77495 10.8969C11.375 10.4688 12.325 8.82188 11.8968 7.22188C11.55 5.925 10.4031 5.05312 9.12808 5C8.94683 4.99375 8.84058 5.19062 8.89683 5.36562C8.96245 5.56562 8.99995 5.77812 8.99995 6Z" fill="#9CA3AF"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div className="terms-wrapper">
                <input
                  type="checkbox"
                  id="terms"
                  className="terms-checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="terms" className="terms-label">
                  I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a>
                </label>
              </div>

              <button className="auth-submit-button register-submit-button" type="submit" disabled={loading}>
                <span>{loading ? 'Creating account...' : 'Sign Up'}</span>
                <svg width="14" height="16" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.7063 8.70664C14.0969 8.31602 14.0969 7.68164 13.7063 7.29102L8.70625 2.29102C8.31563 1.90039 7.68125 1.90039 7.29063 2.29102C6.9 2.68164 6.9 3.31602 7.29063 3.70664L10.5875 7.00039H1C0.446875 7.00039 0 7.44727 0 8.00039C0 8.55352 0.446875 9.00039 1 9.00039H10.5844L7.29375 12.2941C6.90312 12.6848 6.90312 13.3191 7.29375 13.7098C7.68437 14.1004 8.31875 14.1004 8.70938 13.7098L13.7094 8.70977L13.7063 8.70664Z" fill="white"/>
                </svg>
              </button>
            </form>

            <div className="auth-footer">
              <p className="auth-footer-text">Already have an account?</p>
              <Link href="/login" className="auth-footer-link">
                Login here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
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

  return (
    <main className="page-root">
      <header className="brand-header">
        <h1 className="brand-title">FitTrack</h1>
        <p className="brand-subtitle">Track workouts, meals and progress.</p>
      </header>

      <section className="hero-card" style={{ maxWidth: '500px' }}>
        {step === 'signup' ? (
          <>
            <h2 style={{ margin: '0 0 16px' }}>Create Account</h2>
            <p className="hero-text" style={{ margin: '0 0 16px' }}>
              Sign up to start tracking your activities.
            </p>

            {(localError || error) && (
              <div className="error-message">{localError || error}</div>
            )}

            <form onSubmit={handleSignup} className="form">
              <label className="label">
                Email
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </label>

              <label className="label">
                Username
                <input
                  className="input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </label>

              <label className="label">
                Password
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={8}
                />
              </label>

              <label className="label">
                Confirm Password
                <input
                  className="input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  required
                  minLength={8}
                />
              </label>

              <button
                className="btn-primary"
                type="submit"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <p style={{ marginTop: '16px', color: 'var(--muted)', fontSize: '14px' }}>
              Already have an account?{' '}
              <Link href="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                Login here
              </Link>
            </p>
          </>
        ) : (
          <>
            <h2 style={{ margin: '0 0 16px' }}>Confirm Your Email</h2>
            <p className="hero-text" style={{ margin: '0 0 16px' }}>
              We sent a confirmation code to {email}
            </p>

            {(localError || error) && (
              <div className="error-message">{localError || error}</div>
            )}

            <form onSubmit={handleConfirm} className="form">
              <label className="label">
                Confirmation Code
                <input
                  className="input"
                  type="text"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  disabled={loading}
                  placeholder="123456"
                  required
                />
              </label>

              <button
                className="btn-primary"
                type="submit"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Confirming...' : 'Confirm'}
              </button>
            </form>

            <p style={{ marginTop: '16px', fontSize: '14px' }}>
              <button
                onClick={() => setStep('signup')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Back to signup
              </button>
            </p>
          </>
        )}

        <p style={{ marginTop: '16px' }}>
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
            Back to home
          </Link>
        </p>
      </section>
    </main>
  );
}

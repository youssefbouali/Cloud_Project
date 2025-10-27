import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useData } from '../context/DataContext';

export default function Login() {
  const router = useRouter();
  const { login, loading, error } = useData();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <main className="page-root">
      <header className="brand-header">
        <h1 className="brand-title">FitTrack</h1>
        <p className="brand-subtitle">Track workouts, meals and progress.</p>
      </header>

      <section className="hero-card">
        <h2 style={{ margin: '0 0 16px' }}>Login</h2>
        <p className="hero-text" style={{ margin: '0 0 16px' }}>
          Enter your credentials to access your dashboard.
        </p>

        {(localError || error) && (
          <div className="error-message">{localError || error}</div>
        )}

        <form onSubmit={handleSubmit} className="form" style={{ maxWidth: '100%' }}>
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
            Password
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </label>

          <button
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ marginTop: '16px', color: 'var(--muted)', fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            Sign up here
          </Link>
        </p>

        <p style={{ marginTop: '16px' }}>
          <Link href="/" style={{ color: 'var(--muted)', textDecoration: 'none' }}>
            Back to home
          </Link>
        </p>
      </section>
    </main>
  );
}

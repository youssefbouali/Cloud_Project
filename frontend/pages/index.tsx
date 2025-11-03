import Link from 'next/link';
import { useAppSelector } from '../store/hooks';

export default function Home() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <main className="page-root">
      <header className="brand-header">
        <h1 className="brand-title">FitTrack</h1>
        <p className="brand-subtitle">Track workouts, meals and progress.</p>
      </header>

      <section className="hero-card">
        <p className="hero-text">
          Lightweight prototype with AWS backend infrastructure (NestJS + PostgreSQL + RDS).
        </p>

        {isAuthenticated && user ? (
          <Link className="primary-cta" href="/dashboard">
            Open Dashboard
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="primary-cta" href="/login">
              Login
            </Link>
            <Link className="primary-cta" href="/register" style={{ background: '#6b7280' }}>
              Sign Up
            </Link>
          </div>
        )}
      </section>

      <footer className="site-footer">© FitTrack</footer>
    </main>
  );
}

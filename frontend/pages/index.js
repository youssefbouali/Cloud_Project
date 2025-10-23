import Link from 'next/link'

export default function Home(){
  return (
    <main className="page-root">
      <header className="brand-header">
        <h1 className="brand-title">FitTrack</h1>
        <p className="brand-subtitle">Track workouts, meals and progress.</p>
      </header>

      <section className="hero-card">
        <p className="hero-text">Lightweight prototype with in-browser temporary storage (DataContext + localStorage).</p>
        <Link className="primary-cta" href="/dashboard">Open Dashboard</Link>
      </section>

      <footer className="site-footer">© FitTrack</footer>
    </main>
  )
}

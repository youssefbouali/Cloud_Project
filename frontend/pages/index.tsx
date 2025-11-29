import Link from 'next/link';
import { useAppSelector } from '../store/hooks';

export default function Home() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="home-container">
          <div className="header-logo">
            <div className="header-logo-icon">
              <svg width="23" height="18" viewBox="0 0 23 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.375 2.25C3.375 1.62773 3.87773 1.125 4.5 1.125H5.625C6.24727 1.125 6.75 1.62773 6.75 2.25V7.875V10.125V15.75C6.75 16.3723 6.24727 16.875 5.625 16.875H4.5C3.87773 16.875 3.375 16.3723 3.375 15.75V13.5H2.25C1.62773 13.5 1.125 12.9973 1.125 12.375V10.125C0.502734 10.125 0 9.62227 0 9C0 8.37773 0.502734 7.875 1.125 7.875V5.625C1.125 5.00273 1.62773 4.5 2.25 4.5H3.375V2.25ZM19.125 2.25V4.5H20.25C20.8723 4.5 21.375 5.00273 21.375 5.625V7.875C21.9973 7.875 22.5 8.37773 22.5 9C22.5 9.62227 21.9973 10.125 21.375 10.125V12.375C21.375 12.9973 20.8723 13.5 20.25 13.5H19.125V15.75C19.125 16.3723 18.6223 16.875 18 16.875H16.875C16.2527 16.875 15.75 16.3723 15.75 15.75V10.125V7.875V2.25C15.75 1.62773 16.2527 1.125 16.875 1.125H18C18.6223 1.125 19.125 1.62773 19.125 2.25ZM14.625 7.875V10.125H7.875V7.875H14.625Z" fill="white"/>
              </svg>
            </div>
            <h1 className="header-logo-text">FitTrack</h1>
          </div>
          <nav className="header-nav">
            {isAuthenticated && user ? (
              <>
                <Link className="nav-button" href="/dashboard">
                  Dashboard
                </Link>
                <Link className="nav-button" href="/coach-dashboard">
                  Coach Portal
                </Link>
              </>
            ) : (
              <>
                <Link className="nav-button" href="/login">
                  Login
                </Link>
                <Link className="nav-button primary" href="/register">
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <div className="home-container-main">
        <div className="hero-section">
          <h2 className="hero-title">Your Fitness Journey Starts Here</h2>
          <p className="hero-description">
            Track your activities, monitor your progress, and achieve your fitness goals.
          </p>

          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon-wrapper blue">
                <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 0C5.69141 0 6.25 0.558594 6.25 1.25V2.5H11.25V1.25C11.25 0.558594 11.8086 0 12.5 0C13.1914 0 13.75 0.558594 13.75 1.25V2.5H15.625C16.6602 2.5 17.5 3.33984 17.5 4.375V6.25H0V4.375C0 3.33984 0.839844 2.5 1.875 2.5H3.75V1.25C3.75 0.558594 4.30859 0 5 0ZM0 7.5H17.5V18.125C17.5 19.1602 16.6602 20 15.625 20H1.875C0.839844 20 0 19.1602 0 18.125V7.5ZM3.125 10C2.78125 10 2.5 10.2812 2.5 10.625V13.125C2.5 13.4688 2.78125 13.75 3.125 13.75H14.375C14.7188 13.75 15 13.4688 15 13.125V10.625C15 10.2812 14.7188 10 14.375 10H3.125Z" fill="#2563EB"/>
                </svg>
              </div>
              <h3 className="feature-box-title">Track Activities</h3>
              <p className="feature-box-text">Log your workouts with detailed metrics</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrapper green">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 3.75C20 5.71094 17.6914 8.63672 16.6953 9.80469C16.5469 9.97656 16.3281 10.043 16.1289 10H12.5C11.8086 10 11.25 10.5586 11.25 11.25C11.25 11.9414 11.8086 12.5 12.5 12.5H16.25C18.3203 12.5 20 14.1797 20 16.25C20 18.3203 18.3203 20 16.25 20H5.45312C5.79297 19.6133 6.20703 19.1172 6.625 18.5625C6.87109 18.2344 7.125 17.875 7.36719 17.5H16.25C16.9414 17.5 17.5 16.9414 17.5 16.25C17.5 15.5586 16.9414 15 16.25 15H12.5C10.4297 15 8.75 13.3203 8.75 11.25C8.75 9.17969 10.4297 7.5 12.5 7.5H14.0547C13.2344 6.26953 12.5 4.85547 12.5 3.75C12.5 1.67969 14.1797 0 16.25 0C18.3203 0 20 1.67969 20 3.75ZM4.57422 19.1055C4.42578 19.2734 4.29297 19.4219 4.17969 19.5469L4.10938 19.625L4.10156 19.6172C3.86719 19.7969 3.53125 19.7734 3.32031 19.5469C2.33594 18.4766 0 15.7227 0 13.75C0 11.6797 1.67969 10 3.75 10C5.82031 10 7.5 11.6797 7.5 13.75C7.5 14.9219 6.67578 16.3672 5.80078 17.5742C5.38281 18.1484 4.95312 18.668 4.59766 19.0781L4.57422 19.1055ZM5 13.75C5 13.4185 4.8683 13.1005 4.63388 12.8661C4.39946 12.6317 4.08152 12.5 3.75 12.5C3.41848 12.5 3.10054 12.6317 2.86612 12.8661C2.6317 13.1005 2.5 13.4185 2.5 13.75C2.5 14.0815 2.6317 14.3995 2.86612 14.6339C3.10054 14.8683 3.41848 15 3.75 15C4.08152 15 4.39946 14.8683 4.63388 14.6339C4.8683 14.3995 5 14.0815 5 13.75ZM16.25 5C16.5815 5 16.8995 4.8683 17.1339 4.63388C17.3683 4.39946 17.5 4.08152 17.5 3.75C17.5 3.41848 17.3683 3.10054 17.1339 2.86612C16.8995 2.6317 16.5815 2.5 16.25 2.5C15.9185 2.5 15.6005 2.6317 15.3661 2.86612C15.1317 3.10054 15 3.41848 15 3.75C15 4.08152 15.1317 4.39946 15.3661 4.63388C15.6005 4.8683 15.9185 5 16.25 5Z" fill="#10B981"/>
                </svg>
              </div>
              <h3 className="feature-box-title">Monitor Progress</h3>
              <p className="feature-box-text">View your stats and achievements</p>
            </div>

            <div className="feature-box">
              <div className="feature-icon-wrapper purple">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 0C12.6522 0 15.1957 1.05357 17.0711 2.92893C18.9464 4.8043 20 7.34784 20 10C20 12.6522 18.9464 15.1957 17.0711 17.0711C15.1957 18.9464 12.6522 20 10 20C7.34784 20 4.8043 18.9464 2.92893 17.0711C1.05357 15.1957 0 12.6522 0 10C0 7.34784 1.05357 4.8043 2.92893 2.92893C4.8043 1.05357 7.34784 0 10 0ZM9.0625 4.6875V10C9.0625 10.3125 9.21875 10.6055 9.48047 10.7812L13.2305 13.2812C13.6602 13.5703 14.2422 13.4531 14.5312 13.0195C14.8203 12.5859 14.7031 12.0078 14.2695 11.7188L10.9375 9.5V4.6875C10.9375 4.16797 10.5195 3.75 10 3.75C9.48047 3.75 9.0625 4.16797 9.0625 4.6875Z" fill="#9333EA"/>
                </svg>
              </div>
              <h3 className="feature-box-title">Stay Consistent</h3>
              <p className="feature-box-text">Build healthy habits over time</p>
            </div>
          </div>

          <div className="cta-section">
            {isAuthenticated && user ? (
              <Link className="cta-btn primary" href="/dashboard">
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link className="cta-btn primary" href="/login">
                  Login
                </Link>
                <Link className="cta-btn secondary" href="/register">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <footer className="home-footer">
        <div className="home-container">
          <p>© 2024 FitTrack. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

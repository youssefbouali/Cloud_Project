import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { signout } from '../store/slices/authSlice';
import { fetchActivities } from '../store/slices/activitiesSlice';
import ActivityForm from '../components/ActivityForm';
import ActivityList from '../components/ActivityList';

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { items: activities } = useAppSelector((state) => state.activities);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      dispatch(fetchActivities(user.id));
    }
  }, [isAuthenticated, user, dispatch, router]);

  const handleLogout = async () => {
    await dispatch(signout());
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return <div className="page-root">Loading...</div>;
  }

  return (
    <main className="page-root">
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Dashboard</h2>
          <p className="dashboard-sub">Manage your activities</p>
        </div>
        <div className="user-actions">
          <span className="user-email">{user.email}</span>
          <button className="btn-ghost" onClick={handleLogout}>
            Logout
          </button>
          <Link className="back-link" href="/">
            Home
          </Link>
        </div>
      </header>

      <section className="grid">
        <div className="panel">
          <h3 className="panel-title">Add Activity</h3>
          <ActivityForm />
        </div>

        <div className="panel">
          <h3 className="panel-title">
            Your Activities ({activities.length})
          </h3>
          <ActivityList />
        </div>
      </section>
    </main>
  );
}

import { useData } from '../context/DataContext'
import ActivityForm from '../components/ActivityForm'
import ActivityList from '../components/ActivityList'
import Link from 'next/link'

export default function Dashboard(){
  const { user, logout } = useData()

  return (
    <main className="page-root">
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Dashboard</h2>
          <p className="dashboard-sub">Manage your activities</p>
        </div>
        <div className="user-actions">
          <span className="user-email">{user?.email || 'Guest'}</span>
          <button className="btn-ghost" onClick={logout}>Logout</button>
          <Link className="back-link" href="/">Home</Link>
        </div>
      </header>

      <section className="grid">
        <div className="panel">
          <h3 className="panel-title">Add Activity</h3>
          <ActivityForm />
        </div>

        <div className="panel">
          <h3 className="panel-title">Your Activities</h3>
          <ActivityList />
        </div>
      </section>
    </main>
  )
}

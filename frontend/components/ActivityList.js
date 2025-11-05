import { useData } from '../context/DataContext'

export default function ActivityList(){
  const { activities, deleteActivity } = useData()

  if(!activities || activities.length === 0) return <p className="muted">No activities yet.</p>

  return (
    <ul className="activity-list">
      {activities.map(act => (
        <li key={act.id} className="activity-item">
          <div className="activity-main">
            <div>
              <div className="activity-type">{act.type}</div>
              <div className="activity-meta">{act.date} • {act.duration} min • {act.distance} km</div>
            </div>
            <div className="activity-actions">
              <button className="btn-ghost" onClick={() => deleteActivity(act.id)}>Delete</button>
            </div>
          </div>

          {act.photo && (
            <img className="activity-photo" src={act.photo} alt="activity" />
          )}
        </li>
      ))}
    </ul>
  )
}

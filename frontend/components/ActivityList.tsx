import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { deleteActivity } from '../store/slices/activitiesSlice';

export default function ActivityList() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items: activities, loading, error } = useAppSelector(
    (state) => state.activities,
  );
  const [localError, setLocalError] = useState<string>('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setLocalError('');
    setDeleting(id);

    try {
      await dispatch(deleteActivity(id));
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Failed to delete activity',
      );
    } finally {
      setDeleting(null);
    }
  };

  if (!user) {
    return <p className="muted">Please sign in to view activities.</p>;
  }

  if (!activities || activities.length === 0) {
    return <p className="muted">No activities yet.</p>;
  }

  return (
    <>
      {(localError || error) && (
        <div className="error-message">{localError || error}</div>
      )}
      <ul className="activity-list">
        {activities.map((act) => (
          <li key={act.id} className="activity-item">
            <div className="activity-main">
              <div>
                <div className="activity-type">{act.type}</div>
                <div className="activity-meta">
                  {act.date} • {act.duration} min • {act.distance} km
                </div>
              </div>
              <div className="activity-actions">
                <button
                  className="btn-ghost"
                  onClick={() => handleDelete(act.id)}
                  disabled={loading || deleting === act.id}
                >
                  {deleting === act.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            {act.photoUrl && (
              <img
                className="activity-photo"
                src={act.photoUrl}
                alt="activity"
              />
            )}
            {act.photo && (
              <img className="activity-photo" src={act.photo} alt="activity" />
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

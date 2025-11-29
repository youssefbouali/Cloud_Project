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
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 2.25C15 1.65326 14.7629 1.08097 14.341 0.65901C13.919 0.237053 13.3467 0 12.75 0C12.1533 0 11.581 0.237053 11.159 0.65901C10.7371 1.08097 10.5 1.65326 10.5 2.25C10.5 2.84674 10.7371 3.41903 11.159 3.84099C11.581 4.26295 12.1533 4.5 12.75 4.5C13.3467 4.5 13.919 4.26295 14.341 3.84099C14.7629 3.41903 15 2.84674 15 2.25ZM5.89219 8.22656C6.35625 7.7625 6.98906 7.5 7.65 7.5C7.73906 7.5 7.82812 7.50469 7.9125 7.51406L6.45 11.9062C6.01406 13.2188 6.52969 14.6625 7.70625 15.3984L11.7469 17.925L10.5562 22.0875C10.3266 22.8844 10.7906 23.7141 11.5875 23.9437C12.3844 24.1734 13.2141 23.7094 13.4437 22.9125L14.7891 18.2062C15.0656 17.2406 14.6672 16.2094 13.8187 15.6797L11.1562 14.0156L12.6047 10.1531L12.8438 10.7297C13.5469 12.4078 15.1828 13.5 17.0016 13.5H18C18.8297 13.5 19.5 12.8297 19.5 12C19.5 11.1703 18.8297 10.5 18 10.5H17.0016C16.3969 10.5 15.8484 10.1344 15.6188 9.57656L15.3234 8.87344C14.6391 7.22813 13.2562 5.97187 11.55 5.44687L9.26719 4.74375C8.74687 4.58437 8.20312 4.5 7.65469 4.5C6.20156 4.5 4.80469 5.07656 3.77812 6.10781L2.69063 7.19062C2.10469 7.77656 2.10469 8.72812 2.69063 9.31406C3.27656 9.9 4.22812 9.9 4.81406 9.31406L5.89688 8.23125L5.89219 8.22656ZM4.275 16.5H1.5C0.670312 16.5 0 17.1703 0 18C0 18.8297 0.670312 19.5 1.5 19.5H4.7625C5.65312 19.5 6.45937 18.975 6.82031 18.1641L7.35938 16.95L6.91406 16.6688C6.09375 16.1578 5.48438 15.4125 5.1375 14.5641L4.275 16.5Z" fill="#9CA3AF"/>
          </svg>
        </div>
        <p className="empty-text">Please sign in to view activities.</p>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <svg width="21" height="24" viewBox="0 0 21 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 2.25C15 1.65326 14.7629 1.08097 14.341 0.65901C13.919 0.237053 13.3467 0 12.75 0C12.1533 0 11.581 0.237053 11.159 0.65901C10.7371 1.08097 10.5 1.65326 10.5 2.25C10.5 2.84674 10.7371 3.41903 11.159 3.84099C11.581 4.26295 12.1533 4.5 12.75 4.5C13.3467 4.5 13.919 4.26295 14.341 3.84099C14.7629 3.41903 15 2.84674 15 2.25ZM5.89219 8.22656C6.35625 7.7625 6.98906 7.5 7.65 7.5C7.73906 7.5 7.82812 7.50469 7.9125 7.51406L6.45 11.9062C6.01406 13.2188 6.52969 14.6625 7.70625 15.3984L11.7469 17.925L10.5562 22.0875C10.3266 22.8844 10.7906 23.7141 11.5875 23.9437C12.3844 24.1734 13.2141 23.7094 13.4437 22.9125L14.7891 18.2062C15.0656 17.2406 14.6672 16.2094 13.8187 15.6797L11.1562 14.0156L12.6047 10.1531L12.8438 10.7297C13.5469 12.4078 15.1828 13.5 17.0016 13.5H18C18.8297 13.5 19.5 12.8297 19.5 12C19.5 11.1703 18.8297 10.5 18 10.5H17.0016C16.3969 10.5 15.8484 10.1344 15.6188 9.57656L15.3234 8.87344C14.6391 7.22813 13.2562 5.97187 11.55 5.44687L9.26719 4.74375C8.74687 4.58437 8.20312 4.5 7.65469 4.5C6.20156 4.5 4.80469 5.07656 3.77812 6.10781L2.69063 7.19062C2.10469 7.77656 2.10469 8.72812 2.69063 9.31406C3.27656 9.9 4.22812 9.9 4.81406 9.31406L5.89688 8.23125L5.89219 8.22656ZM4.275 16.5H1.5C0.670312 16.5 0 17.1703 0 18C0 18.8297 0.670312 19.5 1.5 19.5H4.7625C5.65312 19.5 6.45937 18.975 6.82031 18.1641L7.35938 16.95L6.91406 16.6688C6.09375 16.1578 5.48438 15.4125 5.1375 14.5641L4.275 16.5Z" fill="#9CA3AF"/>
          </svg>
        </div>
        <p className="empty-text">No activities yet.</p>
        <p className="empty-subtext">Start by adding your first activity!</p>
      </div>
    );
  }

  return (
    <>
      {(localError || error) && (
        <div className="form-error">{localError || error}</div>
      )}
      <ul className="activities-list">
        {activities.map((act) => (
          <li key={act.id} className="activity-list-item">
            <div className="activity-details">
              <div>
                <div className="activity-type-badge">{act.type}</div>
                <div className="activity-metadata">
                  {act.date} • {act.duration} min • {act.distance} km
                </div>
              </div>
              <div className="activity-item-actions">
                <button
                  className="delete-button"
                  onClick={() => handleDelete(act.id)}
                  disabled={loading || deleting === act.id}
                >
                  {deleting === act.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>

            {act.photoUrl && (
              <img
                className="activity-image"
                src={act.photoUrl}
                alt="activity"
              />
            )}
            {act.photo && (
              <img className="activity-image" src={act.photo} alt="activity" />
            )}
          </li>
        ))}
      </ul>
    </>
  );
}

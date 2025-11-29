import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createActivity } from '../store/slices/activitiesSlice';
import { S3Service, initializeS3 } from '../services/s3Service';
import { AuthService } from '../services/authService';

export default function ActivityForm() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { loading: activitiesLoading } = useAppSelector((state) => state.activities);

  const [type, setType] = useState<string>('Course');
  const [date, setDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [localError, setLocalError] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLocalError('Please select an image file');
      return;
    }

    setPhotoFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const initS3 = async () => {
      try {
        const idToken = await AuthService.getIdToken();
        if (idToken) {
          initializeS3(idToken);
        }
      } catch (error) {
        console.error('Failed to initialize S3:', error);
      }
    };

    if (user) {
      initS3();
    }
  }, [user]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError('');

    if (!date || !duration) {
      setLocalError('Date and duration are required');
      return;
    }

    if (!user) {
      setLocalError('Please log in first');
      return;
    }

    try {
      setUploading(true);
      let photoUrl: string | undefined;

      if (photoFile) {
        const fileName = S3Service.generateFileName(
          user.id,
          photoFile.name.split('.').pop() || 'jpg',
        );
        const result = await S3Service.uploadFile(photoFile, fileName);
        photoUrl = result.url;
      }

      await dispatch(
        createActivity({
          type,
          date,
          duration: Number(duration),
          distance: distance ? Number(distance) : 0,
          photoUrl,
        }),
      );

      setType('Course');
      setDate('');
      setDuration('');
      setDistance('');
      setPhotoFile(null);
      setPreviewUrl('');
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Failed to create activity',
      );
    } finally {
      setUploading(false);
    }
  };

  const isLoading = activitiesLoading || uploading;

  return (
    <form className="activity-form" onSubmit={handleSubmit}>
      {localError && <div className="form-error">{localError}</div>}

      <div className="form-group">
        <label className="form-label">Type</label>
        <select
          className="form-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={isLoading}
        >
          <option>Course</option>
          <option>Marche</option>
          <option>Vélo</option>
          <option>Natation</option>
          <option>Gym</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Date</label>
        <input
          className="form-input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Durée (minutes)</label>
        <input
          className="form-input"
          type="number"
          min="0"
          placeholder="Enter duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Distance (km)</label>
        <input
          className="form-input"
          type="number"
          step="0.01"
          min="0"
          placeholder="Enter distance"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Photo</label>
        <div className="file-upload-area">
          <svg width="38" height="30" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.4375 28.125C3.7793 28.125 0 24.3457 0 19.6875C0 16.0078 2.35547 12.8789 5.63672 11.7246C5.63086 11.5664 5.625 11.4082 5.625 11.25C5.625 6.07031 9.82031 1.875 15 1.875C18.4746 1.875 21.5039 3.76172 23.127 6.57422C24.0176 5.97656 25.0957 5.625 26.25 5.625C29.3555 5.625 31.875 8.14453 31.875 11.25C31.875 11.9648 31.7402 12.6445 31.5 13.2773C34.9219 13.9688 37.5 16.998 37.5 20.625C37.5 24.7676 34.1426 28.125 30 28.125H8.4375ZM13.0664 15.4102C12.5156 15.9609 12.5156 16.8516 13.0664 17.3965C13.6172 17.9414 14.5078 17.9473 15.0527 17.3965L17.3379 15.1113V22.9688C17.3379 23.748 17.9648 24.375 18.7441 24.375C19.5234 24.375 20.1504 23.748 20.1504 22.9688V15.1113L22.4355 17.3965C22.9863 17.9473 23.877 17.9473 24.4219 17.3965C24.9668 16.8457 24.9727 15.9551 24.4219 15.4102L19.7344 10.7227C19.1836 10.1719 18.293 10.1719 17.748 10.7227L13.0605 15.4102H13.0664Z" fill="#9CA3AF"/>
          </svg>
          <p className="file-upload-text">{photoFile ? photoFile.name : 'Aucun fichier choisi'}</p>
          <label className="file-upload-button">
            Choose File
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={isLoading}
              className="file-input-hidden"
            />
          </label>
        </div>
        {previewUrl && (
          <div className="image-preview">
            <img src={previewUrl} alt="preview" />
          </div>
        )}
      </div>

      <button className="form-submit" type="submit" disabled={isLoading}>
        {uploading ? 'Uploading...' : isLoading ? 'Adding...' : 'Add Activity'}
      </button>
    </form>
  );
}

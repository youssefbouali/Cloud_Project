import { useState, ChangeEvent, FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createActivity } from '../store/slices/activitiesSlice';
import { S3Service } from '../services/s3Service';

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
    <form className="form" onSubmit={handleSubmit}>
      {localError && <div className="error-message">{localError}</div>}

      <label className="label">
        Type
        <select
          className="select"
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
      </label>

      <label className="label">
        Date
        <input
          className="input"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={isLoading}
          required
        />
      </label>

      <label className="label">
        Durée (minutes)
        <input
          className="input"
          type="number"
          min="0"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          disabled={isLoading}
          required
        />
      </label>

      <label className="label">
        Distance (km)
        <input
          className="input"
          type="number"
          step="0.01"
          min="0"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          disabled={isLoading}
        />
      </label>

      <label className="label">
        Photo
        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={isLoading}
        />
      </label>

      {previewUrl && (
        <div style={{ marginBottom: '12px' }}>
          <img
            src={previewUrl}
            alt="preview"
            style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px' }}
          />
        </div>
      )}

      <div className="form-actions">
        <button className="btn-primary" type="submit" disabled={isLoading}>
          {uploading ? 'Uploading...' : isLoading ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  );
}

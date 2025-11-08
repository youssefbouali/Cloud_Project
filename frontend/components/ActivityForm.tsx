import { useState, ChangeEvent, FormEvent } from 'react';
import { useData } from '../context/DataContext';

export default function ActivityForm() {
  const { addActivity, user, loading, error } = useData();
  const [type, setType] = useState<string>('Course');
  const [date, setDate] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [distance, setDistance] = useState<string>('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string>('');

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
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
      setLocalError('Please sign up or login first');
      return;
    }

    try {
      await addActivity({
        type,
        date,
        duration: Number(duration),
        distance: distance ? Number(distance) : 0,
        photo,
      });
      setType('Course');
      setDate('');
      setDuration('');
      setDistance('');
      setPhoto(null);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to add activity');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      {(localError || error) && (
        <div className="error-message">
          {localError || error}
        </div>
      )}

      <label className="label">
        Type
        <select
          className="select"
          value={type}
          onChange={(e) => setType(e.target.value)}
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
        />
      </label>

      <label className="label">
        Photo
        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={loading}
        />
      </label>

      <div className="form-actions">
        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </div>
    </form>
  );
}

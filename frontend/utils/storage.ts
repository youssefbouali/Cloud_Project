const KEY = 'fittrack:data:v1';

interface StoredData {
  user: { id: string; email: string } | null;
  activities: Activity[];
}

interface Activity {
  id: string;
  type: string;
  date: string;
  duration: number;
  distance: number;
  photo: string | null;
  owner: string | null;
  createdAt: string;
}

export function loadData(): StoredData | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('loadData error', err);
    return null;
  }
}

export function saveData(data: StoredData): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (err) {
    console.error('saveData error', err);
  }
}

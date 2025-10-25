import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { loadData, saveData } from '../utils/storage';

interface User {
  id: string;
  email: string;
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

interface DataContextType {
  user: User | null;
  activities: Activity[];
  signup: (credentials: { email: string; password: string }) => User;
  login: (credentials: { email: string; password: string }) => User;
  logout: () => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt'>) => Activity;
  updateActivity: (activity: Activity) => void;
  deleteActivity: (id: string) => void;
}

interface State {
  user: User | null;
  activities: Activity[];
}

type Action =
  | { type: 'INIT'; payload: State }
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'UPDATE_ACTIVITY'; payload: Activity }
  | { type: 'DELETE_ACTIVITY'; payload: string };

const DataContext = createContext<DataContextType | null>(null);

const initialState: State = {
  user: null,
  activities: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities] };
    case 'UPDATE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };
    case 'DELETE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter((a) => a.id !== action.payload),
      };
    default:
      return state;
  }
}

function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const stored = loadData();
    if (stored) {
      dispatch({ type: 'INIT', payload: stored });
    }
  }, []);

  useEffect(() => {
    saveData(state);
  }, [state]);

  const signup = ({ email }: { email: string; password: string }): User => {
    const user: User = { id: generateId(), email };
    dispatch({ type: 'SET_USER', payload: user });
    return user;
  };

  const login = ({ email }: { email: string; password: string }): User => {
    const user: User = { id: generateId(), email };
    dispatch({ type: 'SET_USER', payload: user });
    return user;
  };

  const logout = (): void => {
    dispatch({ type: 'LOGOUT' });
  };

  const addActivity = (activity: Omit<Activity, 'id' | 'createdAt'>): Activity => {
    const record: Activity = {
      ...activity,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_ACTIVITY', payload: record });
    return record;
  };

  const updateActivity = (activity: Activity): void => {
    dispatch({ type: 'UPDATE_ACTIVITY', payload: activity });
  };

  const deleteActivity = (id: string): void => {
    dispatch({ type: 'DELETE_ACTIVITY', payload: id });
  };

  const value: DataContextType = {
    user: state.user,
    activities: state.activities,
    signup,
    login,
    logout,
    addActivity,
    updateActivity,
    deleteActivity,
  };

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within DataProvider');
  }
  return ctx;
}

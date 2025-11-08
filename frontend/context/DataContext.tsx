import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

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
  ownerId: string;
  createdAt: string;
}

interface DataContextType {
  user: User | null;
  activities: Activity[];
  signup: (credentials: { email: string; password: string }) => Promise<User>;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  logout: () => void;
  addActivity: (activity: Omit<Activity, 'id' | 'ownerId' | 'createdAt'>) => Promise<Activity>;
  updateActivity: (activity: Activity) => Promise<void>;
  deleteActivity: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

interface State {
  user: User | null;
  activities: Activity[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_ACTIVITIES'; payload: Activity[] }
  | { type: 'ADD_ACTIVITY'; payload: Activity }
  | { type: 'DELETE_ACTIVITY'; payload: string };

const DataContext = createContext<DataContextType | null>(null);

const initialState: State = {
  user: null,
  activities: [],
  loading: false,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, error: null };
    case 'LOGOUT':
      return { ...state, user: null, activities: [] };
    case 'SET_ACTIVITIES':
      return { ...state, activities: action.payload };
    case 'ADD_ACTIVITY':
      return { ...state, activities: [action.payload, ...state.activities] };
    case 'DELETE_ACTIVITY':
      return {
        ...state,
        activities: state.activities.filter((a) => a.id !== action.payload),
      };
    default:
      return state;
  }
}

interface DataProviderProps {
  children: ReactNode;
}

export function DataProvider({ children }: DataProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initialize user from token on mount
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      // Validate token by attempting to fetch user's activities
      api
        .getUserActivities('')
        .then((activities) => {
          // If we have a token and can fetch activities, user is logged in
          // For now, we'll fetch from localStorage or from a me endpoint
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            dispatch({ type: 'SET_USER', payload: user });
            dispatch({ type: 'SET_ACTIVITIES', payload: activities });
          }
        })
        .catch(() => {
          api.clearToken();
        });
    }
  }, []);

  const signup = async (credentials: {
    email: string;
    password: string;
  }): Promise<User> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await api.signup(credentials.email, credentials.password);

      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        throw new Error(response.error);
      }

      const user = response.user;
      api.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({ type: 'SET_USER', payload: user });
      dispatch({ type: 'SET_LOADING', payload: false });

      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const login = async (credentials: {
    email: string;
    password: string;
  }): Promise<User> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await api.login(credentials.email, credentials.password);

      if (response.error) {
        dispatch({ type: 'SET_ERROR', payload: response.error });
        throw new Error(response.error);
      }

      const user = response.user;
      api.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(user));

      dispatch({ type: 'SET_USER', payload: user });

      // Fetch user's activities
      const activities = await api.getUserActivities(user.id);
      dispatch({ type: 'SET_ACTIVITIES', payload: activities });

      dispatch({ type: 'SET_LOADING', payload: false });

      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const logout = (): void => {
    api.clearToken();
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const addActivity = async (
    activity: Omit<Activity, 'id' | 'ownerId' | 'createdAt'>,
  ): Promise<Activity> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const newActivity = await api.createActivity(activity);
      dispatch({ type: 'ADD_ACTIVITY', payload: newActivity });
      dispatch({ type: 'SET_LOADING', payload: false });
      return newActivity;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create activity';
      dispatch({ type: 'SET_ERROR', payload: message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const updateActivity = async (activity: Activity): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await api.apiCall(`/api/activities/${activity.id}`, {
        method: 'PUT',
        body: activity,
      });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update activity';
      dispatch({ type: 'SET_ERROR', payload: message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
  };

  const deleteActivity = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await api.deleteActivity(id);
      dispatch({ type: 'DELETE_ACTIVITY', payload: id });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete activity';
      dispatch({ type: 'SET_ERROR', payload: message });
      dispatch({ type: 'SET_LOADING', payload: false });
      throw error;
    }
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
    loading: state.loading,
    error: state.error,
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

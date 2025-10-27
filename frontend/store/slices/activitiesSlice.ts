import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../lib/api';

export interface Activity {
  id: string;
  type: string;
  date: string;
  duration: number;
  distance: number;
  photo?: string;
  photoUrl?: string;
  ownerId: string;
  createdAt: string;
}

export interface ActivitiesState {
  items: Activity[];
  loading: boolean;
  error: string | null;
  selectedActivity: Activity | null;
}

const initialState: ActivitiesState = {
  items: [],
  loading: false,
  error: null,
  selectedActivity: null,
};

export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.getUserActivities(userId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const createActivity = createAsyncThunk(
  'activities/createActivity',
  async (
    activity: Omit<Activity, 'id' | 'ownerId' | 'createdAt'>,
    { rejectWithValue },
  ) => {
    try {
      const response = await api.createActivity(activity);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

export const deleteActivity = createAsyncThunk(
  'activities/deleteActivity',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.deleteActivity(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    selectActivity: (state, action: PayloadAction<Activity | null>) => {
      state.selectedActivity = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create Activity
      .addCase(createActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
        state.error = null;
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete Activity
      .addCase(deleteActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, selectActivity } = activitiesSlice.actions;
export default activitiesSlice.reducer;

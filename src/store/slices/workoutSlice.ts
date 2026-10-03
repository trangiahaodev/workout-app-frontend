import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SetLog {
  setId: string;
  reps: number;
  weight: number;
  completed: boolean;
}

interface WorkoutState {
  isActive: boolean;
  planId: string | null;
  logs: Record<string, SetLog[]>;
}

const initialState: WorkoutState = {
  isActive: false,
  planId: null,
  logs: {},
};

const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
    startWorkout: (state, action: PayloadAction<string>) => {
      state.isActive = true;
      state.planId = action.payload;
      state.logs = {};
    },
    logSet: (
      state,
      action: PayloadAction<{ exerciseId: string; setLog: SetLog }>,
    ) => {
      const { exerciseId, setLog } = action.payload;
      if (!state.logs[exerciseId]) {
        state.logs[exerciseId] = [];
      }
      const existingSetIndex = state.logs[exerciseId].findIndex(
        (s) => s.setId === setLog.setId,
      );
      if (existingSetIndex >= 0) {
        state.logs[exerciseId][existingSetIndex] = setLog;
      } else {
        state.logs[exerciseId].push(setLog);
      }
    },
    finishWorkout: (state) => {
      state.isActive = false;
      state.planId = null;
      state.logs = {};
    },
  },
});

export const { startWorkout, logSet, finishWorkout } = workoutSlice.actions;
export default workoutSlice.reducer;

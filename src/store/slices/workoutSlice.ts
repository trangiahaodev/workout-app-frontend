import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SetLog } from "../../types";

export type { SetLog };

export interface WorkoutState {
  isActive: boolean;
  isCompleted: boolean;
  completedSessionIds: string[];
  planId: string | null;
  sessionId: string | null; // Lưu _id (ObjectId) của WorkoutSession
  logs: Record<string, SetLog[]>; // Key: exerciseId (_id của Exercise)
}

const initialState: WorkoutState = {
  isActive: false,
  isCompleted: false,
  completedSessionIds: [],
  planId: null,
  sessionId: null,
  logs: {},
};

export type StartWorkoutPayload =
  | string
  | { planId?: string | null; sessionId: string };

const workoutSlice = createSlice({
  name: "workout",
  initialState,
  reducers: {
    startWorkout: (state, action: PayloadAction<StartWorkoutPayload>) => {
      state.isActive = true;
      state.isCompleted = false;
      if (typeof action.payload === "string") {
        state.planId = action.payload;
        state.sessionId = action.payload;
      } else {
        state.planId = action.payload.planId ?? null;
        state.sessionId = action.payload.sessionId;
      }
      if (state.sessionId) {
        state.completedSessionIds = state.completedSessionIds.filter(
          (id) => id !== state.sessionId,
        );
      }
      state.logs = {};
    },
    setSessionId: (state, action: PayloadAction<string>) => {
      state.sessionId = action.payload;
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
      if (
        state.sessionId &&
        !state.completedSessionIds.includes(state.sessionId)
      ) {
        state.completedSessionIds.push(state.sessionId);
      }
      state.isActive = false;
      state.isCompleted = true;
      state.planId = null;
      state.sessionId = null;
      state.logs = {};
    },
  },
});

export const { startWorkout, setSessionId, logSet, finishWorkout } =
  workoutSlice.actions;
export default workoutSlice.reducer;

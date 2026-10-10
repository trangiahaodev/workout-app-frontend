import axiosClient from "../api/axiosClient";

export interface SetLog {
  setId: string;
  reps: number;
  weight: number;
  completed: boolean;
}
export type WorkoutLogs = Record<string, SetLog[]>;

// TẠM THỜI: phải đối chiếu lại với Request body của POST /logs trên Swagger
export const buildLogPayload = (planId: string | null, logs: WorkoutLogs) => ({
  planId,
  logs: Object.entries(logs).map(([exerciseId, sets]) => ({
    exerciseId,
    sets,
  })),
});

export const submitWorkoutLog = (payload: unknown) =>
  axiosClient.post("/logs", payload);

export const getWorkoutLogs = () => axiosClient.get("/logs");
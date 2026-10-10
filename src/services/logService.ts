import axiosClient from "../api/axiosClient";

export interface SetLog {
  setId: string;
  reps: number;
  weight: number;
  completed: boolean;
}
export type WorkoutLogs = Record<string, SetLog[]>;

// POST /sessions: tạo buổi tập mới
export const createSession = (planId: string, name: string) =>
  axiosClient.post("/sessions", {
    planId,
    name,
    scheduledDate: new Date().toISOString(),
  });

// POST /logs: mỗi lần gửi 1 bài tập
export const submitExerciseLog = (
  sessionId: string,
  exerciseId: string,
  sets: SetLog[],
  notes = "",
) =>
  axiosClient.post("/logs", {
    sessionId,
    exerciseId,
    sets: sets.map((s) => ({
      reps: s.reps,
      weight: s.weight,
      isCompleted: s.completed,
    })),
    notes,
  });

// Gửi toàn bộ logs trong Redux (mỗi bài tập 1 request)
export const submitWorkoutLogs = async (
  sessionId: string,
  logs: WorkoutLogs,
) => {
  for (const [exerciseId, sets] of Object.entries(logs)) {
    await submitExerciseLog(sessionId, exerciseId, sets);
  }
};

// GET /sessions/plan/{planId}
export const getSessionsByPlan = (planId: string) =>
  axiosClient.get(`/sessions/plan/${planId}`);

// GET /logs/session/{sessionId}
export const getLogsBySession = (sessionId: string) =>
  axiosClient.get(`/logs/session/${sessionId}`);
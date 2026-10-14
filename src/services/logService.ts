import axiosClient from "../api/axiosClient";
import { SetLog, WorkoutSession, WorkoutLog } from "../types";

export type WorkoutLogs = Record<string, SetLog[]>;

// POST /sessions: tạo buổi tập mới
export const createSession = (planId: string, name: string) =>
  axiosClient.post<never, WorkoutSession>("/sessions", {
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
  axiosClient.post<never, WorkoutLog>("/logs", {
    sessionId,
    exerciseId,
    sets: sets.map((s) => ({
      reps: s.reps,
      weight: s.weight,
      isCompleted: s.isCompleted,
    })),
    notes,
  });

// Gửi toàn bộ logs trong Redux (mỗi bài tập 1 request qua Promise.all)
export const submitWorkoutLogs = async (
  sessionId: string,
  logs: WorkoutLogs,
) => {
  const entries = Object.entries(logs).filter(([, sets]) => sets.length > 0);
  return Promise.all(
    entries.map(([exerciseId, sets]) =>
      submitExerciseLog(sessionId, exerciseId, sets),
    ),
  );
};

// GET /sessions/plan/{planId}
export const getSessionsByPlan = (planId: string) =>
  axiosClient.get<never, WorkoutSession[]>(`/sessions/plan/${planId}`);

// GET /logs/session/{sessionId}
export const getLogsBySession = (sessionId: string) =>
  axiosClient.get<never, WorkoutLog[]>(`/logs/session/${sessionId}`);
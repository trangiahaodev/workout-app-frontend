import axiosClient from "../api/axiosClient";
import {
  SessionStatus,
  SetLog,
  WorkoutSession,
  WorkoutLog,
  ExerciseHistoryLog,
} from "../types";

export type WorkoutLogs = Record<string, SetLog[]>;

// POST /sessions: tạo buổi tập mới
export const createSession = (
  planId: string,
  name: string,
  extra?: { status?: SessionStatus; completedDate?: string },
) =>
  axiosClient.post<never, WorkoutSession>("/sessions", {
    planId,
    name,
    scheduledDate: new Date().toISOString(),
    ...extra,
  });

// POST /logs: mỗi lần gửi 1 bài tập
export const submitExerciseLog = (
  sessionId: string,
  exerciseId: string,
  sets: SetLog[],
  notes = "",
  progressPhotoUrl = "",
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
    progressPhotoUrl,
  });

export type ExerciseExtras = Record<
  string,
  { notes: string; progressPhotoUrl: string }
>;

// Gửi toàn bộ logs trong Redux (mỗi bài tập 1 request qua Promise.all)
export const submitWorkoutLogs = async (
  sessionId: string,
  logs: WorkoutLogs,
  extras: ExerciseExtras = {},
) => {
  const entries = Object.entries(logs).filter(([, sets]) => sets.length > 0);
  return Promise.all(
    entries.map(([exerciseId, sets]) =>
      submitExerciseLog(
        sessionId,
        exerciseId,
        sets,
        extras[exerciseId]?.notes,
        extras[exerciseId]?.progressPhotoUrl,
      ),
    ),
  );
};

// GET /sessions/plan/{planId}
export const getSessionsByPlan = (planId: string) =>
  axiosClient.get<never, WorkoutSession[]>(`/sessions/plan/${planId}`);

// GET /logs/session/{sessionId}
export const getLogsBySession = (sessionId: string) =>
  axiosClient.get<never, WorkoutLog[]>(`/logs/session/${sessionId}`);

export const getLogsByExercise = async (
  exerciseId: string,
): Promise<ExerciseHistoryLog[]> => {
  return await axiosClient.get(`/logs/exercise/${exerciseId}`);
};

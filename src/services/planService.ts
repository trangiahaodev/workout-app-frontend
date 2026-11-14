import axiosClient from "../api/axiosClient";
import {
  CreatePlanPayload,
  GoalType,
  LevelType,
  PlanStatus,
  UpdatePlanStatusPayload,
  WorkoutPlan,
  WorkoutSession,
} from "../types";

export interface GenerateRoadmapPayload {
  profileId: string;
  goal: GoalType;
  level: LevelType;
  trainingDaysPerWeek: number;
}

// axiosClient đã trả về response.data; ở đây chấp nhận cả dạng { data: ... }
function unwrap<T>(res: unknown): T {
  if (res && typeof res === "object" && "data" in res) {
    return (res as { data: T }).data;
  }
  return res as T;
}

// GET /plans/profile/{profileId}
export const getPlansByProfile = async (
  profileId: string,
): Promise<WorkoutPlan[]> => {
  const res = await axiosClient.get<never, unknown>(
    `/plans/profile/${profileId}`,
  );
  const list = unwrap<unknown>(res);
  return Array.isArray(list) ? (list as WorkoutPlan[]) : [];
};

// POST /plans
export const createPlan = async (
  payload: CreatePlanPayload,
): Promise<WorkoutPlan | undefined> => {
  const res = await axiosClient.post<never, unknown>("/plans", payload);
  return unwrap<WorkoutPlan | undefined>(res);
};

// PUT /plans/{id}/status
export const updatePlanStatus = async (
  id: string,
  status: PlanStatus,
): Promise<void> => {
  const body: UpdatePlanStatusPayload = { status };
  await axiosClient.put<never, unknown>(`/plans/${id}/status`, body);
};

// GET /sessions/plan/{planId}
export const getPlanSessions = async (
  planId: string,
): Promise<WorkoutSession[]> => {
  const res = await axiosClient.get<never, unknown>(`/sessions/plan/${planId}`);
  const list = unwrap<unknown>(res);
  return Array.isArray(list) ? (list as WorkoutSession[]) : [];
};

// POST /plans/generate
export async function generateRoadmap(
  payload: GenerateRoadmapPayload,
): Promise<{ plan: WorkoutPlan; sessions: WorkoutSession[] }> {
  return axiosClient.post("/plans/generate", payload);
}

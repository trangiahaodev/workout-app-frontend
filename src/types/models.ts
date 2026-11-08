// 1. PROFILE
export type GoalType = "Tăng cơ" | "Giảm mỡ" | "Sức mạnh" | "Giữ dáng, giữ cân";
export type LevelType = "Beginner" | "Intermediate" | "Advanced";

export interface Profile {
  _id: string;
  userId: string;
  goal: GoalType;
  level: LevelType;
  trainingDaysPerWeek: number;
  createdAt?: string;
  updatedAt?: string;
}

// Payload cho POST /profiles (upsertProfile trên backend hiện tại)
export interface UpsertProfilePayload {
  userId: string;
  goal: GoalType;
  level: LevelType;
  trainingDaysPerWeek: number;
}

// 2. EXERCISE (Khớp models/Exercise.js & exerciseController.js)
export type MuscleGroup =
  | "Ngực"
  | "Lưng"
  | "Chân"
  | "Vai"
  | "Tay trước"
  | "Tay sau"
  | "Bụng"
  | "Toàn thân";

export type EquipmentType =
  | "Barbell"
  | "Dumbbell"
  | "Cable Machine"
  | "Machine"
  | "Bodyweight"
  | "Kettlebell"
  | "Mat";

export interface Exercise {
  _id: string;
  name: string;
  muscleGroup: MuscleGroup | string;
  equipmentRequired?: EquipmentType | string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Khi backend dùng .populate("exerciseId", "name muscleGroup")
export interface PopulatedExercise {
  _id: string;
  name: string;
  muscleGroup: string;
}

// 3. WORKOUT PLAN
export type PlanStatus = "active" | "completed" | "abandoned";

export interface WorkoutPlan {
  _id: string;
  profileId: string;
  name: string;
  generatedByAI: boolean;
  status: PlanStatus;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Payload cho POST /plans (createPlan)
export interface CreatePlanPayload {
  profileId: string;
  name: string;
  generatedByAI?: boolean;
  status?: PlanStatus;
  startDate?: string;
  endDate?: string;
}

// Payload cho PUT /plans/:id/status (updatePlanStatus)
export interface UpdatePlanStatusPayload {
  status: PlanStatus;
}

// 4. WORKOUT SESSION
export type SessionStatus = "pending" | "completed" | "skipped";

export interface WorkoutSession {
  _id: string;
  planId: string;
  name: string;
  scheduledDate: string;
  completedDate?: string | null;
  status: SessionStatus;
  createdAt?: string;
  updatedAt?: string;
}

// Payload cho POST /sessions (createSession)
export interface CreateSessionPayload {
  planId: string;
  name: string;
  scheduledDate: string;
  status?: SessionStatus;
}

// 5. WORKOUT LOG
export interface SetLog {
  setId?: string; // Dùng ở Redux UI để tracking
  reps: number;
  weight: number;
  isCompleted: boolean;
}

// Payload cho POST /logs (saveLog)
export interface SaveWorkoutLogPayload {
  sessionId: string;
  exerciseId: string;
  sets: SetLog[];
  notes?: string;
  progressPhotoUrl?: string;
}

// Object trả về khi query WorkoutLog
export interface WorkoutLog {
  _id: string;
  sessionId: string;
  exerciseId: string | PopulatedExercise;
  sets: SetLog[];
  notes?: string;
  progressPhotoUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Dạng dictionary lưu trong Redux store: Key là exerciseId
export type WorkoutLogsState = Record<string, SetLog[]>;

// 6. ANALYTICS & STATS (Phục vụ Phase Thống Kê / Dashboard)
export interface SessionSummary {
  sessionId: string;
  sessionName: string;
  date: string;
  totalVolumeKg: number; // Tổng (weight * reps) của các set completed
  completedSetsCount: number;
  exercisesCount: number;
}

export interface Profile {
  _id: string;
  userId: string;
  goal: "Tăng cơ" | "Giảm mỡ" | "Sức mạnh" | "Giữ dáng, giữ cân" | string;
  level: "Beginner" | "Intermediate" | "Advanced" | string;
  trainingDaysPerWeek: number;
}

export interface Exercise {
  _id: string;
  name: string;
  muscleGroup: string;
  description?: string;
  equipmentRequired: string;
}

export interface WorkoutPlan {
  _id: string;
  profileId: string;
  name: string;
  generatedByAI: boolean;
  status?: "active" | "completed" | "abandoned";
  startDate?: string;
  endDate?: string;
}

export interface WorkoutSession {
  _id: string;
  planId: string;
  name: string;
  scheduledDate: string;
  completedDate?: string;
  status?: "pending" | "completed" | "skipped";
}

export interface SetLog {
  setId?: string;
  reps: number;
  weight: number;
  isCompleted: boolean;
}

export interface PopulatedExercise {
  _id: string;
  name: string;
  muscleGroup: string;
}

export interface WorkoutLog {
  _id: string;
  sessionId: string;
  exerciseId: string | PopulatedExercise;
  sets: SetLog[];
  notes?: string;
  progressPhotoUrl?: string;
  createdAt?: string;
}

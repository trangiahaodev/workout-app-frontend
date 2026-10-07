export interface Profile { _id: string; userId: string; goal: string; level: string; trainingDaysPerWeek: number }
export interface Plan { _id: string; profileId: string; name: string; generatedByAI: boolean }
export interface Session { _id: string; planId: string; name: string; scheduledDate: string }
export interface Exercise { _id: string; name: string; muscleGroup: string; equipmentRequired: string }
// Temporary log contract; replace when the backend schema is available.
export interface WorkoutLog { _id: string; exercise: string; sets: number; reps: number; weight: number; date: string }
export interface HomeData { profile: Profile; plans: Plan[]; sessions: Session[]; exercises: Exercise[]; logs: WorkoutLog[] }

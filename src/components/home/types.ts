import {
  Profile,
  WorkoutPlan,
  WorkoutSession,
  Exercise,
  WorkoutLog,
  SetLog,
  PopulatedExercise,
} from "../../types";

export type {
  Profile,
  WorkoutPlan,
  WorkoutSession,
  Exercise,
  WorkoutLog,
  SetLog,
  PopulatedExercise,
};

// Aliases for backward compatibility in Home components
export type Plan = WorkoutPlan;
export type Session = WorkoutSession;

export interface HomeData {
  profile: Profile;
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  exercises: Exercise[];
  logs: WorkoutLog[];
}

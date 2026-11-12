import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { Exercise, WorkoutPlan } from "../types";

export type RootStackParamList = {
  Home: { tab?: "home" | "plan" } | undefined;
  Profile: undefined;
  WorkoutSession:
    | {
        planId?: string;
        sessionId?: string;
      }
    | undefined;
  History:
    | {
        planId?: string;
        sessionId?: string;
        tab?: "history" | "analytics";
      }
    | undefined;
  Plan: undefined;
  PlanDetail: { plan: WorkoutPlan };
  ExerciseDetail: {
    exerciseId: string;
    exercise?: Exercise;
  };
};

export type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Profile"
>;

export type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Home"
>;

export type WorkoutSessionScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "WorkoutSession"
>;

export type WorkoutSessionScreenRouteProp = RouteProp<
  RootStackParamList,
  "WorkoutSession"
>;

export type HistoryScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "History"
>;

export type HistoryScreenRouteProp = RouteProp<RootStackParamList, "History">;

export type PlanScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Plan"
>;

export type PlanDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "PlanDetail"
>;

export type PlanDetailScreenRouteProp = RouteProp<
  RootStackParamList,
  "PlanDetail"
>;

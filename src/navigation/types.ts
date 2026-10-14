import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";

export type RootStackParamList = {
  Home: undefined;
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
      }
    | undefined;
};

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

export type HistoryScreenRouteProp = RouteProp<
  RootStackParamList,
  "History"
>;

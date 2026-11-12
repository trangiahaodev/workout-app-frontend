import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import WorkoutSessionScreen from "../screens/WorkoutSessionScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import PlanScreen from "../screens/PlanScreen";
import PlanDetailScreen from "../screens/PlanDetailScreen";
import { ProfileProvider } from "../hooks/useProfile";
import { RootStackParamList } from "./types";
import ExerciseDetailScreen from "../screens/ExerciseDetailScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <ProfileProvider>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Plan" component={PlanScreen} />
        <Stack.Screen name="PlanDetail" component={PlanDetailScreen} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      </Stack.Navigator>
    </ProfileProvider>
  );
}

export default AppNavigator;

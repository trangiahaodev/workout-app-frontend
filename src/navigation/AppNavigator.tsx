import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import WorkoutSessionScreen from "../screens/WorkoutSessionScreen";
import HistoryScreen from "../screens/HistoryScreen";
import PlanScreen from "../screens/PlanScreen";
import PlanDetailScreen from "../screens/PlanDetailScreen";
import { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="WorkoutSession"
        component={WorkoutSessionScreen}
      />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Plan" component={PlanScreen} />
      <Stack.Screen name="PlanDetail" component={PlanDetailScreen} />
    </Stack.Navigator>
  );
}

export default AppNavigator;

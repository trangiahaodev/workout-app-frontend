import React from "react";
import { YStack } from "tamagui";
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
import { AuthProvider } from "../hooks/useAuth";
import { AuthGate } from "./AuthGate";
import { ProfileGate } from "./ProfileGate";
import { FloatingAICoach } from "../components/ai/FloatingAICoach";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator({
  currentRouteName,
}: {
  currentRouteName?: string;
}) {
  return (
    // AuthGate: chưa đăng nhập → Login/Register. ProfileGate: chờ profile, 404 → Profile.
    <AuthProvider>
      <YStack flex={1}>
        <AuthGate>
          <ProfileProvider>
            <ProfileGate>
              {(initialRouteName) => (
                <Stack.Navigator
                  initialRouteName={initialRouteName}
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
                  <Stack.Screen name="Profile" component={ProfileScreen} />
                  <Stack.Screen name="Plan" component={PlanScreen} />
                  <Stack.Screen
                    name="PlanDetail"
                    component={PlanDetailScreen}
                  />
                  <Stack.Screen
                    name="ExerciseDetail"
                    component={ExerciseDetailScreen}
                  />
                </Stack.Navigator>
              )}
            </ProfileGate>
          </ProfileProvider>
        </AuthGate>

        <FloatingAICoach currentRouteName={currentRouteName} />
      </YStack>
    </AuthProvider>
  );
}

export default AppNavigator;

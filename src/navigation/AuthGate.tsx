import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Spinner, YStack } from "tamagui";
import { useAuth } from "../hooks/useAuth";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { AuthStackParamList } from "./authTypes";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

// Chưa có token → chỉ cho ở Login/Register; có token → render app chính.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status, userId } = useAuth();

  if (status === "loading") {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Spinner size="large" color="$primary" />
      </YStack>
    );
  }

  if (status === "signedOut" || !userId) {
    return (
      <AuthStack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Register" component={RegisterScreen} />
      </AuthStack.Navigator>
    );
  }

  // key theo userId: đổi tài khoản thì ProfileProvider/Stack mount lại sạch.
  return <React.Fragment key={userId}>{children}</React.Fragment>;
}

export default AuthGate;

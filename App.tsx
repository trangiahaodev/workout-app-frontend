import React from "react";
import { TamaguiProvider } from "tamagui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { Provider as ReduxProvider } from "react-redux";
import { StatusBar } from "expo-status-bar";

import tamaguiConfig from "./tamagui.config";
import AppNavigator from "./src/navigation/AppNavigator";
import { store } from "./src/store";

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#FAFAFA",
    card: "#FFFFFF",
    text: "#111111",
    border: "#E5E5E5",
    primary: "#111111",
  },
};

export default function App() {
  return (
    <ReduxProvider store={store}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="light_nike">
        <SafeAreaProvider>
          <StatusBar style="dark" />
          <NavigationContainer theme={navTheme}>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </TamaguiProvider>
    </ReduxProvider>
  );
}

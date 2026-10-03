import React from "react";
import { TamaguiProvider, Theme } from "tamagui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as ReduxProvider } from "react-redux";

import tamaguiConfig from "./tamagui.config";
import HomeScreen from "./src/screens/HomeScreen";
import { store } from "./src/store";

export default function App() {
  return (
    <ReduxProvider store={store}>
      <TamaguiProvider config={tamaguiConfig} defaultTheme="dark">
        <SafeAreaProvider>
          <NavigationContainer>
            <HomeScreen />
          </NavigationContainer>
        </SafeAreaProvider>
      </TamaguiProvider>
    </ReduxProvider>
  );
}

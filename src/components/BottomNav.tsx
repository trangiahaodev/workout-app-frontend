import React, { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { XStack, YStack, Text, useTheme } from "tamagui";

export interface TabItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
}

const DEFAULT_TABS: TabItem[] = [
  { id: "home", icon: "home", label: "Home" },
  { id: "plan", icon: "calendar", label: "Plan" },
  { id: "history", icon: "clock", label: "History" },
];

export interface BottomNavProps {
  tabs?: TabItem[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  tabs = DEFAULT_TABS,
  activeTabId: externalActiveTab,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();
  const [internalActiveTab, setInternalActiveTab] = useState("home");
  const theme = useTheme();

  const currentTab = externalActiveTab ?? internalActiveTab;

  const handleTabPress = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalActiveTab(tabId);
    }
  };

  const activeColor = theme.primary.val;
  const inactiveColor =
    theme.textSecondary?.val ?? theme.colorMuted?.val ?? "#8E8E93";

  return (
    <XStack
      backgroundColor="$background"
      borderTopWidth={1}
      borderColor="$borderColor"
      paddingBottom={Math.max(insets.bottom, 16)}
      paddingTop="$3"
      justifyContent="space-around"
      alignItems="center">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.id;
        return (
          <YStack
            key={tab.id}
            alignItems="center"
            gap="$1"
            onPress={() => handleTabPress(tab.id)}
            paddingVertical="$1"
            paddingHorizontal="$3"
            pressStyle={{ opacity: 0.7 }}>
            <Feather
              name={tab.icon}
              size={22}
              color={isActive ? activeColor : inactiveColor}
            />
            <Text
              fontSize={11}
              fontWeight={isActive ? "700" : "500"}
              color={isActive ? "$primary" : "$textSecondary"}>
              {tab.label}
            </Text>
          </YStack>
        );
      })}
    </XStack>
  );
};

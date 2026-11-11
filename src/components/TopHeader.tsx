import React from "react";
import { XStack, YStack, Text, useTheme } from "tamagui";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  onProfilePress?: () => void;
  onBack?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = "Workout Log",
  subtitle = "Chào buổi sáng, Hảo!",
  onProfilePress,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const iconColor = theme.textPrimary?.val ?? theme.color?.val ?? "#111111";

  return (
    <XStack
      paddingTop={insets.top + 8}
      paddingBottom="$3.5"
      paddingHorizontal="$4"
      backgroundColor="$backgroundStrong"
      borderBottomWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      justifyContent="space-between">
      <XStack alignItems="center" gap="$3" flex={1}>
        {onBack ? (
          <XStack
            width={40}
            height={40}
            borderRadius={12}
            borderWidth={1}
            borderColor="$borderColor"
            alignItems="center"
            justifyContent="center"
            backgroundColor="$surfaceSubtle"
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={onBack}
            pressStyle={{ opacity: 0.75, scale: 0.96 }}>
            <Feather name="arrow-left" size={20} color={iconColor} />
          </XStack>
        ) : null}

        <YStack gap="$0.5" flex={1}>
          <Text
            fontSize={22}
            fontWeight="800"
            color="$textPrimary"
            letterSpacing={-0.4}>
            {title}
          </Text>
          {subtitle ? (
            <Text fontSize={13} color="$textSecondary" fontWeight="500">
              {subtitle}
            </Text>
          ) : null}
        </YStack>
      </XStack>

      {/* Avatar / Profile Button */}
      {onProfilePress ? (
        <XStack
          width={40}
          height={40}
          borderRadius={12}
          borderWidth={1}
          borderColor="$borderColor"
          alignItems="center"
          justifyContent="center"
          backgroundColor="$surfaceSubtle"
          accessibilityRole="button"
          accessibilityLabel="Mở hồ sơ tập luyện"
          onPress={onProfilePress}
          pressStyle={{ opacity: 0.75, scale: 0.96 }}>
          <Feather name="user" size={18} color={iconColor} />
        </XStack>
      ) : null}
    </XStack>
  );
};

import React from "react";
import { XStack, YStack, Text, useTheme } from "tamagui";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  onProfilePress?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = "WORKOUT LOG",
  subtitle = "Chào buổi sáng, Hảo!",
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const iconColor = theme.white?.val ?? theme.color?.val ?? "#FFFFFF";

  return (
    <XStack
      paddingTop={insets.top + 10}
      paddingBottom="$3.5"
      paddingHorizontal="$4"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderColor="$borderColor"
      alignItems="center"
      justifyContent="space-between">
      <YStack gap="$0.5">
        <Text
          fontSize={20}
          fontWeight="800"
          color="$white"
          textTransform="uppercase"
          letterSpacing={0.5}>
          {title}
        </Text>
        {subtitle ? (
          <Text fontSize={13} color="$textSecondary" fontWeight="500">
            {subtitle}
          </Text>
        ) : null}
      </YStack>

      {/* Avatar / Profile Button */}
      <XStack
        width={42}
        height={42}
        borderRadius="$pill"
        borderWidth={1}
        borderColor="$borderColor"
        alignItems="center"
        justifyContent="center"
        backgroundColor="$cardBg"
        onPress={onProfilePress}
        pressStyle={{ opacity: 0.8 }}>
        <Feather name="user" size={18} color={iconColor} />
      </XStack>
    </XStack>
  );
};

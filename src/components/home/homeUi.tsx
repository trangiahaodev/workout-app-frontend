import React from "react";
import { YStack, XStack, useTheme } from "tamagui";
import { BaseText } from "../BaseText";
import { PrimaryButton } from "../PrimaryButton";
import { Feather } from "@expo/vector-icons";

export const colors = {
  background: "$background",
  card: "$cardBg",
  border: "$borderColor",
  muted: "$textSecondary",
  primary: "$primary",
  text: "$textPrimary",
} as const;

export const ui = {
  card: {
    backgroundColor: "$cardBg" as const,
    borderWidth: 1,
    borderColor: "$borderColor" as const,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  title: {
    color: "$textPrimary" as const,
    fontSize: 18,
    fontWeight: "800" as const,
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  body: {
    color: "$textSecondary" as const,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    color: "$textSecondary" as const,
    fontSize: 12,
    fontWeight: "600" as const,
    letterSpacing: 0.2,
  },
  badge: {
    color: "$textPrimary" as const,
    fontSize: 12,
    fontWeight: "600" as const,
    backgroundColor: "$surfaceSubtle" as const,
    borderWidth: 1,
    borderColor: "$borderColor" as const,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: "flex-start" as const,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "$surfaceSubtle" as const,
    borderWidth: 1,
    borderColor: "$borderColor" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
} as const;

export function Action({
  title,
  onPress,
  secondary = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <PrimaryButton
      title={title}
      onPress={onPress}
      accessibilityRole="button"
      variant={secondary ? "secondary" : "primary"}
      size="md"
    />
  );
}

export function SectionHeading({
  title,
  count: _count,
}: {
  title: string;
  count?: number;
}) {
  return (
    <XStack
      justifyContent="space-between"
      alignItems="center"
      marginTop="$5"
      marginBottom="$3">
      <BaseText accessibilityRole="header" {...ui.title} fontSize={19}>
        {title}
      </BaseText>
    </XStack>
  );
}

export function EmptyState({ text }: { text: string }) {
  return (
    <YStack {...ui.card}>
      <BaseText {...ui.body}>{text}</BaseText>
    </YStack>
  );
}

export function Icon({ name }: { name: keyof typeof Feather.glyphMap }) {
  const theme = useTheme();
  const iconColor = theme.textPrimary?.val ?? "#111111";
  return (
    <YStack {...ui.icon}>
      <Feather name={name} color={iconColor} size={20} />
    </YStack>
  );
}

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

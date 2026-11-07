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
  text: "$white",
} as const;

export const ui = {
  card: {
    backgroundColor: "$cardBg" as const,
    borderWidth: 1,
    borderColor: "$borderColor" as const,
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  title: {
    color: "$white" as const,
    fontSize: 20,
    fontWeight: "800" as const,
    flexShrink: 1,
  },
  body: {
    color: "$textSecondary" as const,
    fontSize: 14,
    lineHeight: 22,
  },
  label: {
    color: "$primary" as const,
    fontSize: 11,
    fontWeight: "800" as const,
    letterSpacing: 1.4,
  },
  badge: {
    color: "$primary" as const,
    fontSize: 12,
    fontWeight: "700" as const,
    backgroundColor: "$surfaceBg" as const,
    borderWidth: 1,
    borderColor: "$borderColor" as const,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start" as const,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "$surfaceBg" as const,
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
      backgroundColor={secondary ? "$cardBg" : "$primary"}
    />
  );
}

export function SectionHeading({
  title,
  count,
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
      <BaseText accessibilityRole="header" {...ui.title} fontSize={18}>
        {title}
      </BaseText>
      {count !== undefined && <BaseText {...ui.badge}>{count}</BaseText>}
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
  const iconColor = theme.primary?.val ?? "#1E90FF";
  return (
    <YStack {...ui.icon}>
      <Feather name={name} color={iconColor} size={22} />
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

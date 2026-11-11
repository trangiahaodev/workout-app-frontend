import React from "react";
import { XStack, YStack } from "tamagui";
import { BaseText } from "../BaseText";
import { Card } from "../Card";
import { PlanStatus, SessionStatus, WorkoutPlan } from "../../types";

export type PlanFilter = "all" | PlanStatus;

export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  active: "Đang hoạt động",
  completed: "Hoàn thành",
  abandoned: "Đã hủy",
};

// Màu trạng thái chuẩn High-Contrast Minimalist
export const PLAN_STATUS_COLOR: Record<PlanStatus, string> = {
  active: "#111111",
  completed: "#10B981",
  abandoned: "#EF4444",
};

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  pending: "Chưa tập",
  completed: "Đã hoàn thành",
  skipped: "Bỏ qua",
};

export const SESSION_STATUS_COLOR: Record<SessionStatus, string> = {
  pending: "#8E8E93",
  completed: "#10B981",
  skipped: "#F59E0B",
};

export function formatDateSafe(value?: string | null): string {
  if (!value) return "";
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return "";
  return new Date(time).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function planDateRange(plan: WorkoutPlan): string {
  const start = formatDateSafe(plan.startDate);
  const end = formatDateSafe(plan.endDate);
  if (start && end) return `${start} - ${end}`;
  return start || end || "Chưa đặt thời gian";
}

export function StatusBadge({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <BaseText
      fontSize={11}
      fontWeight="700"
      letterSpacing={0.2}
      color={color}
      backgroundColor="$surfaceSubtle"
      borderWidth={1}
      borderColor="$borderColor"
      paddingHorizontal={10}
      paddingVertical={4}
      borderRadius={8}
      alignSelf="flex-start"
      overflow="hidden">
      {label}
    </BaseText>
  );
}

const FILTERS: { id: PlanFilter; label: string }[] = [
  { id: "all", label: "Tất cả" },
  { id: "active", label: "Đang chạy" },
  { id: "completed", label: "Hoàn thành" },
  { id: "abandoned", label: "Đã hủy" },
];

export function PlanFilterBar({
  value,
  onChange,
}: {
  value: PlanFilter;
  onChange: (next: PlanFilter) => void;
}) {
  return (
    <XStack gap="$2" flexWrap="wrap">
      {FILTERS.map((item) => {
        const selected = item.id === value;
        return (
          <YStack
            key={item.id}
            onPress={() => onChange(item.id)}
            paddingHorizontal="$3.5"
            paddingVertical="$2"
            borderRadius={12}
            borderWidth={1}
            borderColor={selected ? "$primary" : "$borderColor"}
            backgroundColor={selected ? "$primary" : "$surfaceSubtle"}
            pressStyle={{ opacity: 0.8, scale: 0.96 }}>
            <BaseText
              fontSize={13}
              fontWeight="600"
              color={selected ? "$primaryContrast" : "$textSecondary"}>
              {item.label}
            </BaseText>
          </YStack>
        );
      })}
    </XStack>
  );
}

export function PlanCard({
  plan,
  onPress,
}: {
  plan: WorkoutPlan;
  onPress: () => void;
}) {
  return (
    <Card
      onPress={onPress}
      gap="$2"
      marginBottom="$3"
      pressStyle={{ opacity: 0.9, scale: 0.985 }}>
      <XStack justifyContent="space-between" alignItems="center">
        <StatusBadge
          label={PLAN_STATUS_LABEL[plan.status] ?? plan.status}
          color={PLAN_STATUS_COLOR[plan.status] ?? "#8E8E93"}
        />
        <BaseText fontSize={11} fontWeight="600" color="$textSecondary">
          {plan.generatedByAI ? "AI tạo" : "Tự tạo"}
        </BaseText>
      </XStack>
      <BaseText fontSize={20} fontWeight="800" color="$textPrimary" letterSpacing={-0.3}>
        {plan.name}
      </BaseText>
      <BaseText fontSize={13} color="$textSecondary">
        {planDateRange(plan)}
      </BaseText>
    </Card>
  );
}

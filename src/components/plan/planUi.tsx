import React from "react";
import { XStack, YStack } from "tamagui";
import { BaseText } from "../BaseText";
import { Card } from "../Card";
import { PlanStatus, SessionStatus, WorkoutPlan } from "../../types";

export type PlanFilter = "all" | PlanStatus;

export const PLAN_STATUS_LABEL: Record<PlanStatus, string> = {
  active: "ĐANG HOẠT ĐỘNG",
  completed: "HOÀN THÀNH",
  abandoned: "ĐÃ HỦY",
};

// Màu trạng thái (active dùng màu primary của Thenx, 2 màu còn lại là màu ngữ nghĩa)
export const PLAN_STATUS_COLOR: Record<PlanStatus, string> = {
  active: "#1E90FF",
  completed: "#32D74B",
  abandoned: "#FF453A",
};

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  pending: "CHƯA TẬP",
  completed: "ĐÃ HOÀN THÀNH",
  skipped: "BỎ QUA",
};

export const SESSION_STATUS_COLOR: Record<SessionStatus, string> = {
  pending: "#8E8E93",
  completed: "#32D74B",
  skipped: "#FF9F0A",
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
      fontWeight="800"
      letterSpacing={0.6}
      color={color}
      backgroundColor="$surfaceBg"
      borderWidth={1}
      borderColor={color}
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
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$pill"
            borderWidth={1}
            borderColor={selected ? "$primary" : "$borderColor"}
            backgroundColor={selected ? "$primary" : "$cardBg"}
            pressStyle={{ opacity: 0.8 }}>
            <BaseText
              fontSize={13}
              fontWeight="700"
              color={selected ? "$white" : "$textSecondary"}>
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
      pressStyle={{ opacity: 0.9 }}>
      <XStack justifyContent="space-between" alignItems="center">
        <StatusBadge
          label={PLAN_STATUS_LABEL[plan.status] ?? plan.status}
          color={PLAN_STATUS_COLOR[plan.status] ?? "#8E8E93"}
        />
        <BaseText fontSize={11} fontWeight="700" color="$textSecondary">
          {plan.generatedByAI ? "AI TẠO" : "TỰ TẠO"}
        </BaseText>
      </XStack>
      <BaseText fontSize={20} fontWeight="800" color="$white">
        {plan.name}
      </BaseText>
      <BaseText fontSize={13} color="$textSecondary">
        {planDateRange(plan)}
      </BaseText>
    </Card>
  );
}

import React from "react";
import { YStack, XStack } from "tamagui";
import { BaseText } from "../BaseText";
import { WorkoutLog } from "./types";
import { EmptyState, Icon, formatDate, ui } from "./homeUi";

export function RecentLogsSection({ logs }: { logs: WorkoutLog[] }) {
  if (!logs.length) {
    return (
      <EmptyState text="Chưa có nhật ký. Các buổi tập đã ghi sẽ xuất hiện tại đây." />
    );
  }

  return (
    <YStack gap="$2.5">
      {logs.map((log) => {
        const exerciseName =
          typeof log.exerciseId === "object" && log.exerciseId !== null
            ? log.exerciseId.name
            : "Bài tập";

        const completedSets = Array.isArray(log.sets)
          ? log.sets.filter((s) => s.isCompleted)
          : [];
        const totalSets = Array.isArray(log.sets) ? log.sets.length : 0;
        const maxWeight = Array.isArray(log.sets)
          ? Math.max(...log.sets.map((s) => s.weight || 0), 0)
          : 0;

        const dateStr = log.createdAt ? formatDate(log.createdAt) : "";

        return (
          <YStack key={log._id} {...ui.card}>
            <XStack alignItems="center" gap="$3">
              <Icon name="check-circle" />
              <YStack flex={1} gap="$1">
                <BaseText {...ui.title} fontSize={16}>
                  {exerciseName}
                </BaseText>
                <BaseText {...ui.body} fontSize={13}>
                  {completedSets.length}/{totalSets} hiệp hoàn thành ·{" "}
                  {maxWeight > 0 ? `${maxWeight} kg` : "Bodyweight"}
                </BaseText>
              </YStack>
              {dateStr ? (
                <BaseText {...ui.body} fontSize={12}>
                  {dateStr}
                </BaseText>
              ) : null}
            </XStack>
          </YStack>
        );
      })}
    </YStack>
  );
}

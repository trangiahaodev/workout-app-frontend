import React from "react";
import { ScrollView, XStack, YStack } from "tamagui";
import { Feather } from "@expo/vector-icons";
import { Card } from "../Card";
import { BaseText } from "../BaseText";
import { VolumeHistoryPoint } from "../../types";

interface Props {
  volumeHistory: VolumeHistoryPoint[];
}

function formatKg(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)}k`;
  }
  return `${kg}`;
}

function formatDateLabel(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    return `${d.getDate()}/${d.getMonth() + 1}`;
  } catch {
    return "";
  }
}

export const VolumeTrendChart: React.FC<Props> = ({ volumeHistory }) => {
  if (volumeHistory.length === 0) {
    return null;
  }

  const maxVolume = Math.max(
    ...volumeHistory.map((item) => item.totalVolumeKg),
    1,
  );
  const CHART_HEIGHT = 130;

  return (
    <Card marginBottom="$4" padding="$4" gap="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" gap="$2">
          <Feather name="trending-up" size={17} color="#111111" />
          <BaseText color="$textPrimary" fontSize={16} fontWeight="800">
            Biến thiên khối lượng qua các buổi
          </BaseText>
        </XStack>
        <BaseText color="$textSecondary" fontSize={12}>
          Đơn vị: kg
        </BaseText>
      </XStack>

      {/* Chart container with horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: 8,
          paddingHorizontal: 4,
          alignItems: "flex-end",
          minWidth: "100%",
          justifyContent:
            volumeHistory.length <= 4 ? "space-around" : "flex-start",
        }}>
        <XStack gap="$4" alignItems="flex-end" height={CHART_HEIGHT + 40}>
          {volumeHistory.map((point, index) => {
            const barHeight =
              point.totalVolumeKg > 0
                ? Math.max(14, (point.totalVolumeKg / maxVolume) * CHART_HEIGHT)
                : 6;
            const isHighest =
              point.totalVolumeKg === maxVolume && point.totalVolumeKg > 0;

            return (
              <YStack
                key={point.sessionId || index}
                alignItems="center"
                justifyContent="flex-end"
                minWidth={52}
                height="100%">
                {/* Volume label on top */}
                <BaseText
                  color={isHighest ? "$accent" : "$textSecondary"}
                  fontSize={11}
                  fontWeight={isHighest ? "800" : "600"}
                  marginBottom="$1">
                  {formatKg(point.totalVolumeKg)}
                </BaseText>

                {/* Column bar: Nike Orange for highest PR, solid Obsidian Black for others */}
                <YStack
                  width={26}
                  height={barHeight}
                  backgroundColor={isHighest ? "$accent" : "$primary"}
                  borderTopLeftRadius={6}
                  borderTopRightRadius={6}
                  borderBottomLeftRadius={3}
                  borderBottomRightRadius={3}
                />

                {/* Date label at bottom */}
                <BaseText
                  color="$textSecondary"
                  fontSize={11}
                  marginTop="$2"
                  fontWeight="600">
                  {formatDateLabel(point.date) || `B${index + 1}`}
                </BaseText>
              </YStack>
            );
          })}
        </XStack>
      </ScrollView>
    </Card>
  );
};

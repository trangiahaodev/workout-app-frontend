import React from "react";
import { XStack, YStack } from "tamagui";
import { Feather } from "@expo/vector-icons";
import { Card } from "../Card";
import { BaseText } from "../BaseText";
import { MuscleDistribution } from "../../types";

interface Props {
  distribution: MuscleDistribution[];
}

export const MuscleDistributionSection: React.FC<Props> = ({
  distribution,
}) => {
  if (distribution.length === 0) {
    return null;
  }

  const maxPercentage = Math.max(...distribution.map((item) => item.percentage), 0);

  return (
    <Card marginBottom="$4" padding="$4" gap="$3">
      <XStack alignItems="center" gap="$2">
        <Feather name="pie-chart" size={17} color="#111111" />
        <BaseText color="$textPrimary" fontSize={16} fontWeight="800">
          Phân bổ theo nhóm cơ
        </BaseText>
      </XStack>
      <BaseText color="$textSecondary" fontSize={12} marginTop="$-1">
        Tỷ lệ phần trăm tính theo tổng Volume của từng nhóm cơ
      </BaseText>

      <YStack gap="$3.5" marginTop="$2">
        {distribution.map((item) => {
          const isTop = item.percentage === maxPercentage && item.percentage > 0;
          return (
            <YStack key={item.muscleGroup} gap="$1.5">
              {/* Header row: Muscle name + stats */}
              <XStack justifyContent="space-between" alignItems="center">
                <BaseText color="$textPrimary" fontSize={14} fontWeight="600">
                  {item.muscleGroup}
                </BaseText>
                <XStack alignItems="center" gap="$2">
                  <BaseText color="$textSecondary" fontSize={12}>
                    {item.totalVolumeKg.toLocaleString("vi-VN")} kg (
                    {item.setsCount} sets)
                  </BaseText>
                  <BaseText
                    color={isTop ? "$accent" : "$textPrimary"}
                    fontSize={13}
                    fontWeight="800"
                    minWidth={36}
                    textAlign="right">
                    {item.percentage}%
                  </BaseText>
                </XStack>
              </XStack>

              {/* Progress bar track (Nike High Contrast) */}
              <YStack
                height={8}
                width="100%"
                backgroundColor="$surfaceSubtle"
                borderWidth={1}
                borderColor="$borderColor"
                borderRadius="$pill"
                overflow="hidden">
                <YStack
                  height="100%"
                  width={`${Math.min(100, Math.max(0, item.percentage))}%`}
                  backgroundColor={isTop ? "$accent" : "$primary"}
                  borderRadius="$pill"
                />
              </YStack>
            </YStack>
          );
        })}
      </YStack>
    </Card>
  );
};

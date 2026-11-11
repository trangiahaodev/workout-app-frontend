import React from "react";
import { XStack, YStack } from "tamagui";
import { Feather } from "@expo/vector-icons";
import { Card } from "../Card";
import { BaseText } from "../BaseText";
import { ProgressAnalyticsData } from "../../types";

interface Props {
  data: ProgressAnalyticsData;
}

export const AnalyticsKpiCards: React.FC<Props> = ({ data }) => {
  return (
    <YStack gap="$3" marginBottom="$4">
      {/* 1. Tổng Volume tích lũy (Hero KPI - Nike High-Contrast) */}
      <Card
        padding="$4"
        marginBottom="$0">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack flex={1}>
            <XStack alignItems="center" gap="$2" marginBottom="$1">
              <Feather name="zap" size={16} color="#FF5E00" />
              <BaseText
                color="$textSecondary"
                fontSize={12}
                fontWeight="600"
                letterSpacing={0.2}>
                Tổng khối lượng tích lũy
              </BaseText>
            </XStack>
            <BaseText
              color="$textPrimary"
              fontSize={32}
              fontWeight="800"
              lineHeight={38}
              letterSpacing={-0.5}>
              {data.totalVolumeKg.toLocaleString("vi-VN")}{" "}
              <BaseText color="$textSecondary" fontSize={18} fontWeight="700">
                kg
              </BaseText>
            </BaseText>
            <BaseText color="$textSecondary" fontSize={12} marginTop="$1">
              Tính trên toàn bộ các set tập đã hoàn thành
            </BaseText>
          </YStack>
        </XStack>
      </Card>

      {/* 2. Grid 2 thẻ phụ: Số buổi hoàn thành & Tần suất tuần */}
      <XStack gap="$3">
        {/* Số buổi hoàn thành */}
        <Card flex={1} padding="$3.5" marginBottom="$0" gap="$1">
          <XStack alignItems="center" gap="$1.5">
            <Feather name="check-circle" size={15} color="#111111" />
            <BaseText
              color="$textSecondary"
              fontSize={12}
              fontWeight="600"
              letterSpacing={0.2}>
              Buổi hoàn thành
            </BaseText>
          </XStack>
          <BaseText color="$textPrimary" fontSize={22} fontWeight="800" marginTop="$1">
            {data.completedSessionsCount}{" "}
            <BaseText color="$textSecondary" fontSize={14} fontWeight="600">
              / {data.totalSessionsCount}
            </BaseText>
          </BaseText>
          <XStack
            backgroundColor="$surfaceSubtle"
            borderWidth={1}
            borderColor="$borderColor"
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius={8}
            alignSelf="flex-start"
            marginTop="$1">
            <BaseText color="$textPrimary" fontSize={11} fontWeight="700">
              {data.completionRate}% kế hoạch
            </BaseText>
          </XStack>
        </Card>

        {/* Tần suất tập */}
        <Card flex={1} padding="$3.5" marginBottom="$0" gap="$1">
          <XStack alignItems="center" gap="$1.5">
            <Feather name="calendar" size={15} color="#111111" />
            <BaseText
              color="$textSecondary"
              fontSize={12}
              fontWeight="600"
              letterSpacing={0.2}>
              Tần suất tập
            </BaseText>
          </XStack>
          <BaseText color="$textPrimary" fontSize={22} fontWeight="800" marginTop="$1">
            {data.weeklyFrequency}{" "}
            <BaseText color="$textSecondary" fontSize={13} fontWeight="600">
              buổi/tuần
            </BaseText>
          </BaseText>
          <BaseText
            color="$textSecondary"
            fontSize={11}
            marginTop="$1"
            numberOfLines={1}>
            {data.dominantMuscleGroup
              ? `Tập nhiều: ${data.dominantMuscleGroup}`
              : "Đều đặn hàng tuần"}
          </BaseText>
        </Card>
      </XStack>
    </YStack>
  );
};

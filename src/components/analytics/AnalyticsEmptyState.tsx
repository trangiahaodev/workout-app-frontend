import React from "react";
import { YStack } from "tamagui";
import { Feather } from "@expo/vector-icons";
import { Card } from "../Card";
import { BaseText } from "../BaseText";
import { PrimaryButton } from "../PrimaryButton";

interface Props {
  onStartWorkout?: () => void;
}

export const AnalyticsEmptyState: React.FC<Props> = ({ onStartWorkout }) => {
  return (
    <Card
      alignItems="center"
      justifyContent="center"
      paddingVertical="$6"
      paddingHorizontal="$4"
      gap="$3">
      <YStack
        width={56}
        height={56}
        borderRadius={14}
        backgroundColor="$surfaceSubtle"
        borderWidth={1}
        borderColor="$borderColor"
        alignItems="center"
        justifyContent="center"
        marginBottom="$1">
        <Feather name="activity" size={26} color="#111111" />
      </YStack>

      <BaseText
        color="$textPrimary"
        fontSize={18}
        fontWeight="800"
        textAlign="center">
        Chưa có dữ liệu thống kê
      </BaseText>

      <BaseText
        color="$textSecondary"
        fontSize={13}
        textAlign="center"
        lineHeight={20}
        maxWidth={300}>
        Bạn chưa hoàn thành set tập nào. Hãy bắt đầu buổi tập hôm nay và tích
        lũy Volume để mở khóa toàn bộ biểu đồ tiến độ!
      </BaseText>

      {onStartWorkout && (
        <YStack width="100%" maxWidth={240} marginTop="$2">
          <PrimaryButton title="Bắt đầu tập ngay" onPress={onStartWorkout} />
        </YStack>
      )}
    </Card>
  );
};

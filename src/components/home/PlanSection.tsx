import React from "react";
import { YStack, XStack, Image } from "tamagui";
import { Feather } from "@expo/vector-icons";
import { BaseText } from "../BaseText";
import { WorkoutPlan, WorkoutSession } from "../../types";

const FALLBACK_COVERS = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
];

interface PlanSectionProps {
  plans: WorkoutPlan[];
  sessions: WorkoutSession[];
  onPlanPress: (plan: WorkoutPlan, resolvedCover: string) => void;
}

export function PlanSection({
  plans,
  sessions,
  onPlanPress,
}: PlanSectionProps) {
  if (!plans.length) {
    return (
      <YStack
        backgroundColor="$surfaceBg"
        padding="$4"
        borderRadius={16}
        borderWidth={1}
        borderColor="$borderColor">
        <BaseText color="$textSecondary">
          Chưa có chương trình tập luyện nào cho mục tiêu này.
        </BaseText>
      </YStack>
    );
  }

  return (
    <YStack gap="$3.5">
      {plans.map((plan, index) => {
        const planSessions = sessions.filter((s) => s.planId === plan._id);
        const completedCount = planSessions.filter(
          (s) => s.status === "completed",
        ).length;
        const coverUri =
          plan.coverImage || FALLBACK_COVERS[index % FALLBACK_COVERS.length];

        return (
          <YStack
            key={plan._id}
            backgroundColor="$surfaceBg"
            borderRadius={18}
            overflow="hidden"
            borderWidth={1}
            borderColor="$borderColor"
            pressStyle={{ opacity: 0.92, scale: 0.99 }}
            onPress={() => onPlanPress(plan, coverUri)}>
            {/* Ảnh bìa chương trình */}
            <YStack height={135} backgroundColor="#1C1C1E" position="relative">
              <Image
                source={{ uri: coverUri }}
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                width="100%"
                height="100%"
                resizeMode="cover"
                opacity={0.88}
              />

              {/* Badge nguồn tạo */}
              <XStack
                position="absolute"
                top={12}
                left={12}
                backgroundColor={
                  plan.generatedByAI ? "#EA580C" : "rgba(17, 24, 39, 0.85)"
                }
                paddingHorizontal="$2.5"
                paddingVertical="$1"
                borderRadius={999}
                alignItems="center"
                gap="$1.5">
                <Feather
                  name={plan.generatedByAI ? "cpu" : "edit-3"}
                  size={11}
                  color="#FFFFFF"
                />
                <BaseText fontSize={11} fontWeight="700" color="#FFFFFF">
                  {plan.generatedByAI ? "AI GỢI Ý" : "TỰ THIẾT KẾ"}
                </BaseText>
              </XStack>

              {/* Badge trạng thái */}
              <XStack
                position="absolute"
                top={12}
                right={12}
                backgroundColor={
                  plan.status === "completed"
                    ? "rgba(59, 130, 246, 0.9)"
                    : "rgba(22, 163, 74, 0.9)"
                }
                paddingHorizontal="$2.5"
                paddingVertical="$1"
                borderRadius={999}>
                <BaseText fontSize={11} fontWeight="700" color="#FFFFFF">
                  {plan.status === "completed" ? "Hoàn thành" : "Đang áp dụng"}
                </BaseText>
              </XStack>
            </YStack>

            {/* Nội dung tóm tắt */}
            <XStack
              padding="$3.5"
              alignItems="center"
              justifyContent="space-between"
              gap="$3">
              <YStack flex={1} gap="$1">
                <BaseText fontSize={12} fontWeight="600" color="$textSecondary">
                  {planSessions.length} buổi tập • Đã xong {completedCount}/
                  {planSessions.length}
                </BaseText>
                <BaseText
                  fontSize={17}
                  fontWeight="800"
                  color="$textPrimary"
                  numberOfLines={1}>
                  {plan.name}
                </BaseText>
              </YStack>

              <YStack
                width={34}
                height={34}
                borderRadius={17}
                backgroundColor="$surfaceSubtle"
                alignItems="center"
                justifyContent="center">
                <Feather name="chevron-right" size={18} color="#111827" />
              </YStack>
            </XStack>
          </YStack>
        );
      })}
    </YStack>
  );
}

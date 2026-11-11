import React from "react";
import { YStack, XStack } from "tamagui";
import { BaseText } from "../BaseText";
import { Profile } from "./types";
import { ui } from "./homeUi";

export function ProfileOverview({ profile }: { profile: Profile }) {
  return (
    <YStack {...ui.card} marginTop="$4">
      <BaseText {...ui.label}>Mục tiêu của bạn</BaseText>
      <BaseText {...ui.title} fontSize={26}>
        {profile.goal}
      </BaseText>
      <BaseText {...ui.body}>
        Từng buổi tập nhỏ. Một phiên bản tốt hơn.
      </BaseText>
      <XStack flexWrap="wrap" gap="$2">
        <BaseText {...ui.badge}>
          {profile.level === "Beginner"
            ? "Người mới bắt đầu"
            : profile.level}
        </BaseText>
        <BaseText {...ui.badge}>
          {profile.trainingDaysPerWeek} buổi / tuần
        </BaseText>
      </XStack>
    </YStack>
  );
}
